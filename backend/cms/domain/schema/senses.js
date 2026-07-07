import { str, arr, obj } from "./_helpers.js";
const SENSES = ["Sight", "Smell", "Sound", "Touch", "Taste"];
const sense  = obj({ key: str(20, { enum: SENSES }), text: str(300) });
export default obj({ title: str(120), items: arr(sense, 5, 5) });
