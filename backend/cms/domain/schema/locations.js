import { str, bool, arr, obj } from "./_helpers.js";
const outlet = obj({
  flagship: bool(), region: str(40), name: str(80),
  area: str(80), address: str(200), hours: str(120), maps: str(300),
});
export default obj({ outlets: arr(outlet, 1, 40) });
