export default function Sidebar() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-6">ADMIN PANEL</h2>

      <ul className="space-y-3">
        <li><a href="/admin" className="block hover:text-gray-300">Dashboard</a></li>
        <li><a href="/admin/products" className="block hover:text-gray-300">Produk</a></li>
        <li><a href="/admin/booking" className="block hover:text-gray-300">Booking</a></li>
        <li><a href="/admin/users" className="block hover:text-gray-300">Users</a></li>
        <li><a href="/admin/settings" className="block hover:text-gray-300">Pengaturan</a></li>
      </ul>
    </div>
  );
}
