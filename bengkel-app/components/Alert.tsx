"use client";

import Swal from "sweetalert2";

/* ================= BASE STYLE ================= */
const baseStyle = {
  background: "#ffffff",
  color: "#234C6A",
  confirmButtonColor: "#000000",
  cancelButtonColor: "#e5e7eb",
  buttonsStyling: false,
  showCloseButton: true,
  allowOutsideClick: true,
  allowEscapeKey: true,
  customClass: {
    popup: "rounded-2xl shadow-xl",
    title: "text-2xl font-extrabold",
    htmlContainer: "text-base text-gray-600",
    closeButton: "text-gray-400 hover:text-red-500",
    confirmButton:
      "px-6 py-3 rounded-full font-bold text-white text-base bg-black hover:bg-gray-800",
    cancelButton:
      "px-6 py-3 rounded-full font-bold text-gray-700 bg-gray-200 hover:bg-gray-300",
  },
};

/* ================= ALERT 1: LOGIN REQUIRED ================= */
export const alertLoginRequired = async () => {
  return Swal.fire({
    ...baseStyle,
    icon: "warning",
    title: "Sesi Berakhir",
    html: `
      <p class="mt-2">
        Untuk melanjutkan, silakan <b>login terlebih dahulu</b>.
      </p>
    `,
    showCancelButton: true,
    confirmButtonText: "Login",
    cancelButtonText: "Batal",
    reverseButtons: true,


    timer: 6000, // 6 detik
    timerProgressBar: true,
  });
};

/* ================= ALERT 2: INFO SETELAH DITUTUP ================= */
export const alertLoginInfo = async () => {
  return Swal.fire({
    ...baseStyle,
    icon: "info",
    title: "Informasi",
    text: "Kamu bisa login kapan saja melalui menu akun.",
    confirmButtonText: "Mengerti",
  });
};

/* ================= SUCCESS ================= */
export const alertSuccess = (message: string) => {
  return Swal.fire({
    ...baseStyle,
    icon: "success",
    title: "Berhasil",
    text: message,
    timer: 1600,
    showConfirmButton: false,
  });
};

/* ================= ERROR ================= */
export const alertError = (message: string) => {
  return Swal.fire({
    ...baseStyle,
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonText: "OK",

    timer: 2000, // 6 detik
    timerProgressBar: true,
  });
};
export const alertConfirmDelete = () => {
  return Swal.fire({
    ...baseStyle,
    icon: "warning",
    title: "Yakin ingin menghapus?",
    text: "Produk ini akan dihapus dari keranjang",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });
};
export const alertValidation = (message: string) => {
  return Swal.fire({
    ...baseStyle,
    icon: "warning",
    title: "Validasi Gagal",
    text: message,
    confirmButtonText: "Mengerti",
  });
};
export const alertValidate = (message: string) => {
  return Swal.fire({
    ...baseStyle,
    icon: "warning",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });
};


