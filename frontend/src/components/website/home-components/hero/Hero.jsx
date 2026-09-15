import HeroSlider from "./Hero-slider";

export default function Hero() {
  const heroData = [
    {
      tag: "SUMMER COLLECTION 2026",
      title: "Where Comfort Meets",
      italic: "Craft",
      desc: "Scandinavian-inspired furniture for modern living. Curated pieces that endure seasons.",
      btnOne: "Shop Collection",
      btnTwo: "View Lookbook",
      image:
        "https://images.unsplash.com/photo-1758448511322-8bfc73daf606?auto=format&fit=crop&w=1400&q=80",
    },
    {
      tag: "BEDROOM EDIT",
      title: "Rest,",
      italic: "Reimagined",
      desc: "Soft textures and calm tones for a bedroom that feels like a retreat.",
      btnOne: "Shop Bedroom",
      btnTwo: "View Lookbook",
      image:
        "https://images.unsplash.com/photo-1748679979601-dc9ec43d900d?auto=format&fit=crop&w=1400&q=80",
    },
    {
      tag: "LIVING ROOM",
      title: "Design That",
      italic: "Feels Home",
      desc: "Premium furniture made for warm, elegant and timeless interiors.",
      btnOne: "Shop Now",
      btnTwo: "Explore More",
      image:
        "https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=1400&q=80",
    },
  ];

  return <HeroSlider heroData={heroData} />;
}
