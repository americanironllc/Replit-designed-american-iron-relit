import telehandlerImg from "@assets/TELEHANDLER_1771680608848.png";
import asphaltPaversImg from "@assets/ASPHALT_PAVERS_1771680608848.png";
import offHighwayTrucksImg from "@assets/OFF-HIGHWAY_TRUCKS_1771680608848.png";
import forestryImg from "@assets/FORESTERY__1771680608848.jpeg";
import trackDozerImg from "@assets/track_dozer_1771680608848.png";
import scrapersImg from "@assets/Scrapers_1771680608848.png";
import skidsteerImg from "@assets/Skidsteer_1771680608848.png";
import wheelLoadersImg from "@assets/Wheel_Loaders_1771680608848.jpg";
import motorGradersImg from "@assets/Motor_Graders_1771680608848.png";
import compactorsImg from "@assets/Compactors_1771680608848.png";
import excavatorsImg from "@assets/Excavators_1771680608848.png";
import bulldozersImg from "@assets/Bulldozers_1771680608848.png";
import backhoeImg from "@assets/backhoe_1771680608848.png";
import articulatedTruckImg from "@assets/Articulated_truck_1771680608848.png";
import coldPlanerImg from "@assets/Cold_Planer_1771680608848.png";

const CATEGORY_IMAGES: Record<string, string> = {
  "EXCAVATORS": excavatorsImg,
  "BULLDOZERS": bulldozersImg,
  "WHEEL LOADERS": wheelLoadersImg,
  "ARTICULATED TRUCKS": articulatedTruckImg,
  "MOTOR GRADERS": motorGradersImg,
  "SCRAPERS": scrapersImg,
  "TELEHANDLERS": telehandlerImg,
  "TRACK DOZERS": trackDozerImg,
  "SKIDSTEER": skidsteerImg,
  "BACKHOES": backhoeImg,
  "OFF-HIGHWAY TRUCKS": offHighwayTrucksImg,
  "COMPACTORS": compactorsImg,
  "COLD PLANERS": coldPlanerImg,
  "ASPHALT PAVERS": asphaltPaversImg,
  "FORESTRY EQUIPMENT": forestryImg,
  "OTHER EQUIPMENT": excavatorsImg,
};

export function getCategoryImage(category: string | null | undefined): string {
  if (!category) return bulldozersImg;
  return CATEGORY_IMAGES[category.toUpperCase()] || bulldozersImg;
}
