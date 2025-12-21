export default function FooterUsr() {
  return (
    <footer
      className="w-full text-gray-300 py-4 mt-10"
      style={{ backgroundColor: "#234C6A" }}
    >
      <div className="container mx-auto text-center text-sm">
        © {new Date().getFullYear()} Bengkel Dexar — Create with ♥ by team
        Bengkel App
      </div>
    </footer>
  );
}
