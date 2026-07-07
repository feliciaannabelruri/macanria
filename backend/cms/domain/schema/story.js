import { str, arr, obj } from "./_helpers.js";
const mascot = obj({ zh: str(20), name: str(60), tagline: str(60), desc: str(200), img: str(200) });
export default obj({ title: str(120), body: str(600), mascots: arr(mascot, 2, 2) });
