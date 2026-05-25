import { motion } from 'motion/react';
import { ShieldCheck, Crosshair, Award, Star } from 'lucide-react';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.15
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#1A1A1A] py-16 md:py-24 font-sans">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16"
      >
        {/* Title Block */}
        <div className="text-center">
          <motion.span 
            variants={childVariants}
            className="text-xs uppercase tracking-widest text-[#C9A961] font-bold font-mono"
          >
            Sejarah & Nilai Kami
          </motion.span>
          <motion.h1 
            variants={childVariants}
            className="mt-2 text-3xl font-extrabold tracking-tight text-[#1A1A1A] uppercase sm:text-4xl"
          >
            Tentang Kami
          </motion.h1>
          <div className="mx-auto mt-3 h-1 w-16 bg-[#C9A961] rounded" />
        </div>

        {/* 2 Column Layout - Desktop: 2 Col, Mobile: 1 Col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Teks Deskripsi */}
          <motion.div variants={childVariants} className="space-y-6 text-left">
            <h2 className="text-xl font-bold text-[#C9A961] uppercase tracking-wide">Sejarah Singkat</h2>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Prime Property didirikan pada 2015 dengan komitmen penuh menyediakan properti berkualitas premium bagi seluruh segmen masyarakat di Indonesia yang menginginkan keleluasaan hunian eksklusif dan peluang penanaman aset terbaik.
            </p>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Kami bermula dari tim kecil beranggotakan lima orang profesional real estate berdedikasi tinggi di Jakarta. Seiring bertahun-tahun penuh komitmen, kami berhasil memperluas portofolio pemasaran kami di berbagai kota utama, mengelola ruko komersial yang bernilai strategis tinggi dan villa-villa tropis prestisius.
            </p>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Hingga saat ini, Prime Property telah berhasil mengantarkan lebih dari seribu keluarga dan pebisnis mendapatkan unit impian mereka dengan legalitas hukum yang steril, proses administrasi transparan, serta harga wajar yang berdaya saing tinggi.
            </p>
          </motion.div>

          {/* Visual/Quote Panel (Soft Gray bg sekunder #F5F5F5) */}
          <motion.div 
            variants={childVariants}
            className="rounded-2xl border border-zinc-200 bg-[#F5F5F5] p-8 md:p-10 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-24 w-24 -translate-y-4 translate-x-4 rounded-full bg-[#C9A961]/5 blur-2xl" />
            
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A961]/10 border border-[#C9A961]/20 mb-6">
              <Star className="h-6 w-6 text-[#C9A961]" />
            </div>

            <blockquote className="text-lg italic text-[#C9A961] font-bold leading-relaxed text-left">
              "Kualitas sebuah layanan dinilai dari kemudahan yang dirasakan pelanggan ketika semua proses administrasi berjalan lancar tanpa hambatan tersembunyi."
            </blockquote>

            <div className="mt-8 text-left">
              <p className="text-sm font-bold text-zinc-800">Aris Munandar</p>
              <p className="text-xs text-[#C9A961] font-mono uppercase tracking-wider mt-1 font-bold">Pendiri & CEO, Prime Property</p>
            </div>
          </motion.div>
        </div>

        {/* Visi dan Misi Section (Bawah) */}
        <motion.div 
          variants={childVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-zinc-100"
        >
          {/* Visi Box - Card #F5F5F5 */}
          <div className="rounded-2xl border border-zinc-200 bg-[#F5F5F5] p-8 text-left space-y-4 shadow-sm">
            <div className="flex items-center space-x-3.5 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A961]/10 border border-[#C9A961]/25 text-[#C9A961]">
                <Crosshair className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wide">Visi Kami</h3>
            </div>
            <p className="text-zinc-650 text-sm leading-relaxed font-sans">
              "Menjadi perusahaan properti terpercaya di Indonesia yang meredefinisi standarisasi keandalan data, legalitas terjamin, serta pengelolaan hunian mewah berpenilaian prima."
            </p>
          </div>

          {/* Misi Box - Card #F5F5F5 */}
          <div className="rounded-2xl border border-zinc-200 bg-[#F5F5F5] p-8 text-left space-y-4 shadow-sm">
            <div className="flex items-center space-x-3.5 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A961]/10 border border-[#C9A961]/25 text-[#C9A961]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A] uppercase tracking-wide">Misi Kami</h3>
            </div>
            <ul className="space-y-3.5 text-zinc-650 text-sm list-decimal list-inside pl-1 font-sans">
              <li>Menghadirkan listing properti ruko komersial dan villa tropis dengan uji kelayakan fisik serta nilai hukum yang mutlak demi keamanan pembeli.</li>
              <li>Memberikan transparansi penuh terhadap rincian ukuran lebar-panjang, status kesiapan huni, serta nilai transaksi riil tanpa manipulasi harga.</li>
              <li>Membina talenta agen profesional internal dengan integritas tinggi dan mengedepankan etika kerja yang transparan bagi kenyamanan konsumen.</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
