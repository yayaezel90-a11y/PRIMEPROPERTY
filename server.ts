import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { dbInstance } from './server-db.js';

// Convert EMS path if required, we parse it or use standard process.cwd()
const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Helper middleware to get IP
  app.use((req, _res, next) => {
    // Basic IP acquisition
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    (req as any).clientIp = typeof ip === 'string' ? ip.split(',')[0].trim() : String(ip);
    next();
  });

  // Authentication Middleware supporting both cookies and fallback headers (essential for sandbox iFrame tests)
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let sessionToken = req.cookies.session_token;
    if (!sessionToken) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7).trim();
      } else if (req.headers['x-session-token']) {
        sessionToken = req.headers['x-session-token'] as string;
      }
    }

    if (!sessionToken) {
      return res.status(401).json({ error: 'Sesi berakhir atau Anda belum login.' });
    }
    const user = dbInstance.getUserById(sessionToken);
    if (!user) {
      res.clearCookie('session_token');
      return res.status(401).json({ error: 'User tidak ditemukan.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Akun Anda dinonaktifkan oleh Superadmin.' });
    }
    (req as any).user = user;
    next();
  };

  const requireSuperadmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Akses ditolak. Anda memerlukan hak akses Superadmin.' });
    }
    next();
  };

  // --- API Endpoints ---

  // Auth: Get Current Profile
  app.get('/api/auth/me', (req, res) => {
    let sessionToken = req.cookies.session_token;
    if (!sessionToken) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7).trim();
      } else if (req.headers['x-session-token']) {
        sessionToken = req.headers['x-session-token'] as string;
      }
    }

    if (!sessionToken) {
      return res.json({ user: null });
    }
    const user = dbInstance.getUserById(sessionToken);
    if (!user || !user.isActive) {
      res.clearCookie('session_token');
      return res.json({ user: null });
    }
    const { passwordHash, ...safeUser } = user as any;
    res.json({ user: safeUser });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const failedRecord = dbInstance.getFailedRecord(email);
    const now = new Date();

    if (failedRecord.lockoutUntil && new Date(failedRecord.lockoutUntil) > now) {
      const minutesLeft = Math.ceil((new Date(failedRecord.lockoutUntil).getTime() - now.getTime()) / (60 * 1000));
      return res.status(403).json({
        error: `Akun dikunci karena terlalu banyak percobaan masuk. Silakan coba lagi dalam ${minutesLeft} menit.`
      });
    }

    const user = dbInstance.getUserByEmail(email);
    if (!user) {
      dbInstance.incrementFailedAttempt(email);
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Akun Anda dinonaktifkan oleh Superadmin.' });
    }

    const passwordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordValid) {
      dbInstance.incrementFailedAttempt(email);
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    // Success! Clear failed login attempts and write session cookie
    dbInstance.clearFailedLockout(email);

    res.cookie('session_token', user.id, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    const { passwordHash, ...safeUser } = user as any;
    res.json({ success: true, user: safeUser });
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('session_token');
    res.json({ success: true });
  });

  // Contacts: Submit Contact Form
  app.post('/api/contact', (req, res) => {
    const { nama, email, nomorHp, pesan } = req.body;
    const clientIp = (req as any).clientIp || '127.0.0.1';

    // Anti-spam rate limiting: 3 submit per IP per hour
    const limitCheck = dbInstance.checkContactRateLimit(clientIp);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: 'Terlalu banyak mengirim pesan. Anda dibatasi maksimal 3 pesan per jam.'
      });
    }

    // Validations: all field filled, email valid, phone level min 10 digs
    if (!nama || !email || !nomorHp || !pesan) {
      return res.status(400).json({ error: 'Semua kolom formulir wajib diisi.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format email tidak valid.' });
    }

    const phoneDigits = nomorHp.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return res.status(400).json({ error: 'Nomor HP harus terdiri dari minimal 10 digit.' });
    }

    // Save success message to tables with simulated triggers
    const savedMessage = dbInstance.createContactMessage({
      nama,
      email,
      nomorHp,
      pesan,
      ipAddress: clientIp
    });

    // Simulate sending email notification to administrator in background console
    console.log(`[EMAIL SIMULATOR] Notifikasi Pesan Masuk Prime Property`);
    console.log(`Dari: ${nama} <${email}> (${nomorHp})`);
    console.log(`Isi Pesan: ${pesan}`);
    console.log(`Ditulis dari IP: ${clientIp} pada ${savedMessage.createdAt}`);

    res.json({
      success: true,
      message: 'Pesan terkirim, tim kami akan menghubungi Anda.'
    });
  });

  // Property Listing & Search (protected by auth)
  app.get('/api/properties', requireAuth, (req, res) => {
    let list = dbInstance.getProperties(false); // only non-deleted

    // Sorting parameters
    const sortBy = (req.query.sortBy as string) || 'nama'; // nama, harga, tanggal_dibuat, status
    const sortDir = (req.query.sortDir as string) || 'asc'; // asc, desc

    // Filtering logic
    const search = (req.query.search as string || '').toLowerCase();
    const kawasan = req.query.kawasan ? (typeof req.query.kawasan === 'string' ? [req.query.kawasan] : req.query.kawasan as string[]) : [];
    const hadap = req.query.hadap ? (typeof req.query.hadap === 'string' ? [req.query.hadap] : req.query.hadap as string[]) : [];
    const siap = req.query.siap ? (typeof req.query.siap === 'string' ? [req.query.siap] : req.query.siap as string[]) : [];
    const tipe = req.query.tipe as string; // 'Semua' | 'Ruko' | 'Villa'
    const status = req.query.status as string; // 'Semua' | 'in_stock' | 'sold_out'
    const carport = req.query.carport as string; // 'Ya' | 'Tidak' | 'Semua'
    const priceMax = req.query.priceMax ? parseInt(req.query.priceMax as string) : NaN;
    const lebarMin = req.query.lebarMin ? parseFloat(req.query.lebarMin as string) : NaN;

    if (search) {
      list = list.filter(p => 
        p.nama_property.toLowerCase().includes(search) || 
        (p.group || '').toLowerCase().includes(search) ||
        p.kawasan.some(k => k.toLowerCase().includes(search))
      );
    }

    if (kawasan.length > 0) {
      list = list.filter(p => p.kawasan.some(k => kawasan.includes(k)));
    }

    if (hadap.length > 0) {
      list = list.filter(p => p.hadap.some(h => hadap.includes(h)));
    }

    if (siap.length > 0) {
      // client map database enum matches: siap_huni, siap_kosong, siap_huni_renovasi
      list = list.filter(p => siap.includes(p.siap));
    }

    if (tipe && tipe !== 'Semua') {
      list = list.filter(p => p.tipe === tipe);
    }

    if (status && status !== 'Semua') {
      list = list.filter(p => p.status === status);
    }

    if (carport && carport !== 'Semua') {
      const wantCarport = carport === 'Ya';
      list = list.filter(p => p.carport === wantCarport);
    }

    if (!isNaN(priceMax)) {
      list = list.filter(p => p.price <= priceMax);
    }

    if (!isNaN(lebarMin)) {
      list = list.filter(p => p.lebar >= lebarMin);
    }

    // Sort order
    list.sort((a, b) => {
      let fieldA: any = a.nama_property;
      let fieldB: any = b.nama_property;

      if (sortBy === 'harga') {
        fieldA = a.price;
        fieldB = b.price;
      } else if (sortBy === 'tanggal_dibuat') {
        fieldA = a.created_at;
        fieldB = b.created_at;
      } else if (sortBy === 'status') {
        fieldA = a.status;
        fieldB = b.status;
      }

      if (typeof fieldA === 'string') {
        return sortDir === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
      } else {
        return sortDir === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      }
    });

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const total = list.length;
    const paginatedList = list.slice(offset, offset + limit);

    res.json({
      properties: paginatedList,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  });

  // Landing Page: Featured Properties list (Public endpoint - max 6, read-only, random or sorted)
  app.get('/api/public/featured', (_req, res) => {
    // Get non-deleted and status in_stock
    const available = dbInstance.getProperties().filter(p => p.status === 'in_stock');
    
    // Shuffle and pick 6
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const featured = shuffled.slice(0, 6);

    res.json(featured);
  });

  // Get single property details (Admin and Superadmin)
  app.get('/api/properties/:id', requireAuth, (req, res) => {
    const prop = dbInstance.getPropertyById(req.params.id);
    if (!prop) {
      return res.status(404).json({ error: 'Properti tidak ditemukan.' });
    }
    res.json(prop);
  });

  // CRUDS (Superadmin only) - Create Property
  app.post('/api/properties', requireAuth, requireSuperadmin, (req, res) => {
    const p = req.body;
    const user = (req as any).user;

    // Server-side validation
    if (!p.nama_property || p.nama_property.length < 3 || p.nama_property.length > 100) {
      return res.status(400).json({ error: 'Nama properti harus di antara 3 hingga 100 karakter.' });
    }
    const lebar = parseFloat(p.lebar);
    const panjang = parseFloat(p.panjang);
    if (isNaN(lebar) || lebar <= 0 || isNaN(panjang) || panjang <= 0) {
      return res.status(400).json({ error: 'Dimensi lebar dan panjang harus lebih besar dari 0.' });
    }

    const price = parseInt(p.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Harga harus lebih besar dari Rp 0.' });
    }

    const tingkat = parseFloat(p.tingkat);
    if (isNaN(tingkat) || tingkat < 1 || tingkat > 10) {
      return res.status(400).json({ error: 'Tingkat lantai harus di antara 1 dan 10.' });
    }

    if (p.maps_link && p.maps_link.trim() !== '') {
      if (!p.maps_link.toLowerCase().includes('google.com/maps')) {
        return res.status(400).json({ error: 'Link Google Maps harus berupa URL valid dari domain google.com/maps' });
      }
    }

    const newProp = dbInstance.createProperty({
      nama_property: p.nama_property,
      group: p.group || null,
      lebar,
      panjang,
      hadap: p.hadap || [],
      tipe: p.tipe || 'Ruko',
      tingkat,
      price,
      carport: !!p.carport,
      status: p.status || 'in_stock',
      siap: p.siap || 'siap_huni',
      maps_link: p.maps_link || null,
      kawasan: p.kawasan || [],
      unit: p.unit || null,
      created_by: user.id
    });

    // Write audit log
    dbInstance.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'TAMBAH PROPERTI',
      propertyId: newProp.id,
      propertyName: newProp.nama_property,
      oldData: null,
      newData: newProp
    });

    res.status(201).json(newProp);
  });

  // CRUDS (Superadmin only) - Update Property
  app.put('/api/properties/:id', requireAuth, requireSuperadmin, (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const user = (req as any).user;

    const oldProp = dbInstance.getPropertyById(id);
    if (!oldProp) {
      return res.status(404).json({ error: 'Properti tidak ditemukan.' });
    }

    // Server-side validation
    if (updates.nama_property !== undefined) {
      if (updates.nama_property.length < 3 || updates.nama_property.length > 100) {
        return res.status(400).json({ error: 'Nama properti harus di antara 3 hingga 100 karakter.' });
      }
    }

    const lebar = updates.lebar !== undefined ? parseFloat(updates.lebar) : undefined;
    const panjang = updates.panjang !== undefined ? parseFloat(updates.panjang) : undefined;
    if (lebar !== undefined && (isNaN(lebar) || lebar <= 0)) {
      return res.status(400).json({ error: 'Lebar harus lebih besar dari 0.' });
    }
    if (panjang !== undefined && (isNaN(panjang) || panjang <= 0)) {
      return res.status(400).json({ error: 'Panjang harus lebih besar dari 0.' });
    }

    const price = updates.price !== undefined ? parseInt(updates.price) : undefined;
    if (price !== undefined && (isNaN(price) || price <= 0)) {
      return res.status(400).json({ error: 'Harga harus lebih besar dari Rp 0.' });
    }

    const tingkat = updates.tingkat !== undefined ? parseFloat(updates.tingkat) : undefined;
    if (tingkat !== undefined && (isNaN(tingkat) || tingkat < 1 || tingkat > 10)) {
      return res.status(400).json({ error: 'Tingkat lantai harus di antara 1 dan 10.' });
    }

    if (updates.maps_link && updates.maps_link.trim() !== '') {
      if (!updates.maps_link.toLowerCase().includes('google.com/maps')) {
        return res.status(400).json({ error: 'Link Google Maps harus berupa URL valid dari domain google.com/maps' });
      }
    }

    // Keep deep copy for oldData in audit log
    const oldDataCopy = JSON.parse(JSON.stringify(oldProp));

    const updatedProp = dbInstance.updateProperty(id, {
      ...(updates.nama_property !== undefined && { nama_property: updates.nama_property }),
      ...(updates.group !== undefined && { group: updates.group }),
      ...(lebar !== undefined && { lebar }),
      ...(panjang !== undefined && { panjang }),
      ...(updates.hadap !== undefined && { hadap: updates.hadap }),
      ...(updates.tipe !== undefined && { tipe: updates.tipe }),
      ...(tingkat !== undefined && { tingkat }),
      ...(price !== undefined && { price }),
      ...(updates.carport !== undefined && { carport: !!updates.carport }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.siap !== undefined && { siap: updates.siap }),
      ...(updates.maps_link !== undefined && { maps_link: updates.maps_link }),
      ...(updates.kawasan !== undefined && { kawasan: updates.kawasan }),
      ...(updates.unit !== undefined && { unit: updates.unit })
    });

    if (!updatedProp) {
      return res.status(500).json({ error: 'Gagal memperbarui properti.' });
    }

    // Write audit log
    dbInstance.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'UPDATE PROPERTI',
      propertyId: updatedProp.id,
      propertyName: updatedProp.nama_property,
      oldData: oldDataCopy,
      newData: updatedProp
    });

    res.json(updatedProp);
  });

  // CRUDS (Superadmin only) - Delete Property (Soft Delete)
  app.delete('/api/properties/:id', requireAuth, requireSuperadmin, (req, res) => {
    const id = req.params.id;
    const user = (req as any).user;

    const prop = dbInstance.getPropertyById(id);
    if (!prop) {
      return res.status(404).json({ error: 'Properti tidak ditemukan.' });
    }

    dbInstance.deleteProperty(id);

    dbInstance.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'HAPUS PROPERTI',
      propertyId: prop.id,
      propertyName: prop.nama_property,
      oldData: prop,
      newData: null
    });

    res.json({ success: true, message: `Properti ${prop.nama_property} berhasil dihapus.` });
  });

  // Soft Delete Archive: Get Archived Properties (Superadmin only)
  app.get('/api/properties-archived', requireAuth, requireSuperadmin, (req, res) => {
    const archived = dbInstance.getProperties(true).filter(p => !!p.deleted_at);
    res.json(archived);
  });

  // Restore Soft Deleted Property (Superadmin only)
  app.post('/api/properties/:id/restore', requireAuth, requireSuperadmin, (req, res) => {
    const id = req.params.id;
    const user = (req as any).user;

    const prop = dbInstance.getProperties(true).find(p => p.id === id);
    if (!prop) {
      return res.status(404).json({ error: 'Properti tidak ditemukan.' });
    }

    const restored = dbInstance.restoreProperty(id);

    dbInstance.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'PULIHKAN ARSIP',
      propertyId: prop.id,
      propertyName: prop.nama_property,
      oldData: null,
      newData: restored
    });

    res.json({ success: true, message: `Properti ${prop.nama_property} berhasil dipulihkan.` });
  });

  // Audit Logs - Superadmin Only
  app.get('/api/audit-logs', requireAuth, requireSuperadmin, (req, res) => {
    res.json(dbInstance.getAuditLogs());
  });

  // User Administration (Superadmin only: Create, toggle active, reset password of Admin accounts)
  app.get('/api/users', requireAuth, requireSuperadmin, (req, res) => {
    // Return safe list of users
    const userList = dbInstance.getUsers().map(({ passwordHash, ...safe }) => safe);
    res.json(userList);
  });

  // User Admin: Register new Admin
  app.post('/api/users', requireAuth, requireSuperadmin, (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const existing = dbInstance.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email admin ini sudah terdaftar.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password harus minimal 6 karakter.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = dbInstance.createUser({
      email,
      passwordHash,
      role: 'admin',
      isActive: true
    });

    // Audit log
    const user = (req as any).user;
    dbInstance.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'BUAT AKUN ADMIN',
      propertyId: 'N/A',
      propertyName: email,
      oldData: null,
      newData: { id: newUser.id, email: newUser.email, role: newUser.role, isActive: newUser.isActive }
    });

    const { passwordHash: _, ...safe } = newUser as any;
    res.status(201).json(safe);
  });

  // User Admin: Toggle isActive
  app.post('/api/users/:id/toggle', requireAuth, requireSuperadmin, (req, res) => {
    const adminId = req.params.id;
    const target = dbInstance.getUserById(adminId);
    if (!target) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    if (target.role === 'superadmin') {
      return res.status(400).json({ error: 'Tidak dapat menonaktifkan akun Superadmin.' });
    }

    const updated = dbInstance.updateUser(adminId, { isActive: !target.isActive });

    // Audit log
    const user = (req as any).user;
    dbInstance.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: updated?.isActive ? 'AKTIFKAN AKUN' : 'NONAKTIFKAN AKUN',
      propertyId: 'N/A',
      propertyName: target.email,
      oldData: { isActive: target.isActive },
      newData: { isActive: updated?.isActive }
    });

    res.json({ success: true, isActive: updated?.isActive });
  });

  // User Admin: Reset Password admin
  app.post('/api/users/:id/reset', requireAuth, requireSuperadmin, (req, res) => {
    const adminId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru harus minimal 6 karakter.' });
    }

    const target = dbInstance.getUserById(adminId);
    if (!target) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    dbInstance.updateUser(adminId, { passwordHash });

    // Audit log
    const user = (req as any).user;
    dbInstance.createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'RESET PASSWORD AKUN',
      propertyId: 'N/A',
      propertyName: target.email,
      oldData: null,
      newData: null
    });

    res.json({ success: true, message: `Password untuk ${target.email} berhasil direset.` });
  });


  // Serve static files in production / setup Vite middleware in dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PRIME PROPERTY SERVER] running on http://localhost:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error('Fatal initialization error in custom server', e);
});
