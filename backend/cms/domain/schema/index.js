import general from "./general.js";     import menu from "./menu.js";
import scoops from "./scoops.js";        import story from "./story.js";
import senses from "./senses.js";        import gallery from "./gallery.js";
import locations from "./locations.js";  import footer from "./footer.js";
import parallax from "./parallax.js";
export const SCHEMAS = { general, menu, scoops, story, senses, gallery, locations, footer, parallax };
export const isSection = (name) => Object.prototype.hasOwnProperty.call(SCHEMAS, name);
