import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_FILE = path.join(process.cwd(), 'db.json');

export interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'superadmin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DBProperty {
  id: string;
  nama_property: string;
  group?: string | null;
  lebar: number;
  panjang: number;
  hadap: string[];
  tipe: 'Ruko' | 'Villa';
  tingkat: number;
  price: number;
  carport: boolean;
  status: 'in_stock' | 'sold_out';
  siap: 'siap_huni' | 'siap_kosong' | 'siap_huni_renovasi';
  maps_link?: string | null;
  kawasan: string[];
  unit?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string | null;
}

export interface DBAuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  propertyId: string;
  propertyName: string;
  oldData?: any;
  newData?: any;
  createdAt: string;
}

export interface DBContactMessage {
  id: string;
  nama: string;
  email: string;
  nomorHp: string;
  pesan: string;
  ipAddress: string;
  createdAt: string;
}

export interface FailedLoginRecord {
  count: number;
  lockoutUntil: string | null;
  lastAttemptAt: string;
}

export interface DBSchema {
  users: DBUser[];
  properties: DBProperty[];
  auditLogs: DBAuditLog[];
  contactMessages: DBContactMessage[];
  failedLogins: { [email: string]: FailedLoginRecord };
  submitCounts: { [ip: string]: { count: number; hourStart: string } };
}

// Custom simple UUID generator representing CUID
function generateId() {
  return 'c' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
}

export class MockDatabase {
  private data!: DBSchema;

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure standard model arrays exist
        if (!this.data.users) this.data.users = [];
        if (!this.data.properties) this.data.properties = [];
        if (!this.data.auditLogs) this.data.auditLogs = [];
        if (!this.data.contactMessages) this.data.contactMessages = [];
        if (!this.data.failedLogins) this.data.failedLogins = {};
        if (!this.data.submitCounts) this.data.submitCounts = {};
        return;
      } catch (e) {
        console.error("Error reading db.json, re-seeding...", e);
      }
    }
    this.seed();
  }

  public save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
  }

  private seed() {
    console.log("Seeding database with default users and properties...");
    const salt = bcrypt.genSaltSync(10);
    const superadminHash = bcrypt.hashSync('Super123!', salt);
    const adminHash = bcrypt.hashSync('Admin123!', salt);

    const superadminId = 'usr_superadmin';
    const adminId = 'usr_admin';

    const users: DBUser[] = [
      {
        id: superadminId,
        email: 'superadmin@primeproperty.com',
        passwordHash: superadminHash,
        role: 'superadmin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: adminId,
        email: 'admin@primeproperty.com',
        passwordHash: adminHash,
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Seed 50+ properties
    const kawasans = ['Krakatau', 'Pancing', 'Cemara Asri/Kuala', 'Tembung', 'Helvetia'];
    const siapStates: ('siap_huni' | 'siap_kosong' | 'siap_huni_renovasi')[] = ['siap_huni', 'siap_kosong', 'siap_huni_renovasi'];
    const directions = ['Utara', 'Selatan', 'Timur', 'Barat'];
    const groups = ['Blok A', 'Blok B', 'Cluster Golden', 'Cluster Platinum', 'Sektor V', 'Kawasan Utama', null];
    
    const propNames = [
      'Cemara Asri Townhouse Superior',
      'Pancing Executive Villa Indah',
      'Krakatau Premium Ruko Utama',
      'Helvetia Green Residence Blok 3',
      'Tembung Minimalis Ruko Modern',
      'Krakatau Mansion Suite',
      'Cemara Regency Luxury Garden',
      'Kuala Luxury Villa Seaside',
      'Pancing Grande Commercial Ruko',
      'Helvetia Botanical Garden',
      'Tembung Boulevard Shophouse',
      'Orchid Villa Cemara Asri',
      'Golden Krakatau Residence',
      'Pancing Smart Ruko Cluster',
      'Helvetia Platinum Townhouse',
      'Tembung Asri Sharia Villa',
      'Kuala View Executive Bungalow',
      'Royal Cemara Asri Estate',
      'Krakatau Business Center Square',
      'Helvetia Harmony Townhouse',
      'Pancing Residence Blok G',
      'Tembung Central Business Ruko',
      'The Peak Villa Krakatau',
      'Cemara Palms Luxury Villa',
      'Emerald Helvetia Residence',
      'Pancing Riverview Townhouse',
      'Villa Shanti Kuala',
      'Tembung Garden Shophouse',
      'Krakatau Avenue Elite Ruko',
      'Cemara Wood Residensi',
      'Kuala Sunset Beach Villa',
      'Pancing Boulevard Commercials',
      'Helvetia Heights Elite',
      'Tembung Sunrise Park Villa',
      'Krakatau Central Shophouse',
      'Prime Cemara Gardenia',
      'Sweet Home Vista Pancing',
      'Helvetia View Family Home',
      'Tembung Lakeside Villa',
      'Metro Krakatau Commercials',
      'Cemara Point Strategic Ruko',
      'Kuala Marina View Mansion',
      'Pancing Corner Shophouse',
      'Helvetia Parkview Townhouse',
      'Tembung Cozy Classic Villa',
      'Krakatau Townsquare Ruko',
      'Cemara Spring Hill Residence',
      'Kuala Prestige Tropical Villa',
      'Pancing High Street Ruko',
      'Helvetia Grand Imperial Villa',
      'Tembung Regency Square',
      'Krakatau Royal Residence II',
      'Cemara Asri Palace'
    ];

    const properties: DBProperty[] = [];

    propNames.forEach((name, idx) => {
      const type = idx % 2 === 0 ? 'Ruko' : 'Villa';
      const selectedKawasan = [kawasans[idx % kawasans.length]];
      
      // Let's create varying prices
      // From 500 million to 12.5 billion
      const basePrice = 500000000;
      const multiplier = (idx * 235000000) % 12000000000;
      const price = basePrice + multiplier;

      // Lebar format max 2 decimals, e.g. between 4.00 and 15.00
      const lebar = parseFloat((4.5 + (idx * 1.5) % 11.5).toFixed(2));
      const panjang = parseFloat((10 + (idx * 2.5) % 20.5).toFixed(2));

      // Hadap selection (can choose 1 or 2 directions)
      const hadapCount = (idx % 3 === 0) ? 2 : 1;
      const hadap: string[] = [];
      for (let h = 0; h < hadapCount; h++) {
        const dir = directions[(idx + h) % directions.length];
        if (!hadap.includes(dir)) hadap.push(dir);
      }

      // Tingkat max 1 decimal e.g. 1.0 to 4.5
      const tingkat = parseFloat((1 + (idx * 0.5) % 4).toFixed(1));

      // Carport boolean
      const carport = idx % 3 !== 0;

      // Status in_stock vs sold_out (75% in stock, 25% sold out)
      const status = idx % 4 === 0 ? 'sold_out' : 'in_stock';

      // Siap status
      const siap = siapStates[idx % siapStates.length];

      // Google Maps Links (Google maps embed dummy or link)
      const maps_link = `https://www.google.com/maps/place/Medan,+Kota+Medan,+Sumatera+Utara/@3.642263,98.530357,12z`;

      const group = groups[idx % groups.length];
      const unit = idx % 5 === 0 ? `B-${idx + 10}` : idx % 7 === 1 ? `A-0${idx}` : null;

      properties.push({
        id: `prop_${idx + 1}_${generateId()}`,
        nama_property: name,
        group,
        lebar,
        panjang,
        hadap,
        tipe: type,
        tingkat,
        price,
        carport,
        status,
        siap,
        maps_link,
        kawasan: selectedKawasan,
        unit,
        created_at: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(), // older properties seeded earlier
        updated_at: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString(),
        created_by: superadminId,
        deleted_at: null
      });
    });

    this.data = {
      users,
      properties,
      auditLogs: [],
      contactMessages: [],
      failedLogins: {},
      submitCounts: {}
    };

    this.save();
  }

  // User Actions
  public getUsers(): DBUser[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): DBUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): DBUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: Omit<DBUser, 'id' | 'createdAt' | 'updatedAt'>): DBUser {
    const newUser: DBUser = {
      ...user,
      id: 'usr_' + generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<Omit<DBUser, 'id' | 'createdAt' | 'updatedAt'>>): DBUser | undefined {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return undefined;
    Object.assign(user, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    this.save();
    return user;
  }

  // Failed Login Lockouts
  public getFailedRecord(email: string): FailedLoginRecord {
    const canonicalEmail = email.toLowerCase();
    if (!this.data.failedLogins[canonicalEmail]) {
      this.data.failedLogins[canonicalEmail] = {
        count: 0,
        lockoutUntil: null,
        lastAttemptAt: new Date().toISOString()
      };
    }
    return this.data.failedLogins[canonicalEmail];
  }

  public incrementFailedAttempt(email: string) {
    const record = this.getFailedRecord(email);
    record.count += 1;
    record.lastAttemptAt = new Date().toISOString();
    
    if (record.count >= 5) {
      // Accoun locked out for 15 minutes
      const lockoutTime = new Date();
      lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
      record.lockoutUntil = lockoutTime.toISOString();
    }
    this.save();
  }

  public clearFailedLockout(email: string) {
    const record = this.getFailedRecord(email);
    record.count = 0;
    record.lockoutUntil = null;
    record.lastAttemptAt = new Date().toISOString();
    this.save();
  }

  // Properties CRUD
  public getProperties(includeDeleted = false): DBProperty[] {
    if (includeDeleted) {
      return this.data.properties;
    }
    return this.data.properties.filter(p => !p.deleted_at);
  }

  public getPropertyById(id: string): DBProperty | undefined {
    return this.data.properties.find(p => p.id === id);
  }

  public createProperty(property: Omit<DBProperty, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): DBProperty {
    const newProperty: DBProperty = {
      ...property,
      id: 'prop_' + generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    this.data.properties.push(newProperty);
    this.save();
    return newProperty;
  }

  public updateProperty(id: string, updates: Partial<Omit<DBProperty, 'id' | 'created_at' | 'updated_at'>>): DBProperty | undefined {
    const property = this.data.properties.find(p => p.id === id);
    if (!property) return undefined;
    Object.assign(property, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    this.save();
    return property;
  }

  public deleteProperty(id: string): DBProperty | undefined {
    const property = this.data.properties.find(p => p.id === id);
    if (!property) return undefined;
    property.deleted_at = new Date().toISOString();
    this.save();
    return property;
  }

  public restoreProperty(id: string): DBProperty | undefined {
    const property = this.data.properties.find(p => p.id === id);
    if (!property) return undefined;
    property.deleted_at = null;
    property.updated_at = new Date().toISOString();
    this.save();
    return property;
  }

  // Audit Logs
  public getAuditLogs(): DBAuditLog[] {
    return [...this.data.auditLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public createAuditLog(log: Omit<DBAuditLog, 'id' | 'createdAt'>): DBAuditLog {
    const newLog: DBAuditLog = {
      ...log,
      id: 'log_' + generateId(),
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.push(newLog);
    this.save();
    return newLog;
  }

  // Contact Messages & Rate Limiting
  public getContactMessages(): DBContactMessage[] {
    return this.data.contactMessages;
  }

  public createContactMessage(msg: Omit<DBContactMessage, 'id' | 'createdAt'>): DBContactMessage {
    const newMsg: DBContactMessage = {
      ...msg,
      id: 'msg_' + generateId(),
      createdAt: new Date().toISOString()
    };
    this.data.contactMessages.push(newMsg);
    this.save();
    return newMsg;
  }

  public checkContactRateLimit(ip: string): { allowed: boolean; count: number } {
    const ipRecord = this.data.submitCounts[ip];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (!ipRecord || new Date(ipRecord.hourStart) < oneHourAgo) {
      this.data.submitCounts[ip] = {
        count: 1,
        hourStart: now.toISOString()
      };
      this.save();
      return { allowed: true, count: 1 };
    }

    if (ipRecord.count >= 3) {
      return { allowed: false, count: ipRecord.count };
    }

    ipRecord.count += 1;
    this.save();
    return { allowed: true, count: ipRecord.count };
  }
}

export const dbInstance = new MockDatabase();
