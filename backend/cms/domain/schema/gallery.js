import { str, arr, obj } from "./_helpers.js";
const photo = obj({ img: str(200), layout: str(40) });
export default obj({ ticker: str(300), photos: arr(photo, 8, 8) });
