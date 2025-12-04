export default function NavbarUsr() {
  return (
    <nav className="w-full text-white p-4 shadow-md" style={{ backgroundColor: "#234C6A" }}>
      <div className="container mx-auto flex items-center justify-between">
        <a href="/" className="text-xl font-bold">BengkelApp</a>

        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="/" className="hover:text-gray-300">Home</a>
          <a href="/marketplace" className="hover:text-gray-300">Marketplace</a>
          <a href="/booking" className="hover:text-gray-300">Booking</a>
          <a href="/booking/history" className="hover:text-gray-300">History</a>
          <a href="/profile" className="hover:text-gray-300">Profile</a>
        </div>
      </div>
    </nav>
  );
}
