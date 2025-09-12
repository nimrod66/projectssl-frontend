import router from "next/router";

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  router.push("/login");
};

export function Logoout() {
  return (
    <button
      onClick={handleLogout}
      className="btn btn-primary btn-sm bg-yellow-400 text-purple-800 hover:bg-yellow-500 font-semibold"
    >
      Logout
    </button>
  );
}
