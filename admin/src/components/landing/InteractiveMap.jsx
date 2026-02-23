import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Info } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix Leaflet marker icon issue
const customIcon = L.divIcon({
    html: renderToString(
        <div className="relative flex items-center justify-center">
            <div className="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-10 h-10 bg-primary rounded-2xl flex items-center justify-center border-2 border-white shadow-xl rotate-45">
                <MapPin className="w-6 h-6 text-white -rotate-45" />
            </div>
        </div>
    ),
    className: 'custom-div-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
});

export default function InteractiveMap() {
    const position = [24.8934, 67.1863]; // Karachi Malir broad area

    return (
        <section id="location" className="py-24 bg-white relative overflow-hidden">
            <div className="px-6 mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Text Content */}
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-bold uppercase tracking-widest border rounded-full border-primary/20 bg-primary/5 text-primary shadow-sm">
                            <Navigation className="w-4 h-4" />
                            Our Operational Hub
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight mb-6 leading-tight">
                            Strategically rooted in <span className="text-primary italic">Malir, Karachi.</span>
                        </h2>
                        <p className="text-lg font-medium text-slate-500 mb-8 leading-relaxed">
                            Our central distribution center in Malir ensures lightning-fast delivery across Karachi.
                            Built to handle high-frequency orders with sub-30 minute fulfillment targets.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-5 glass-card rounded-2xl border-slate-100 hover:border-primary/20 transition-all duration-300">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Primary Hub</h4>
                                    <p className="text-sm text-slate-500">Malir Cantonment / Jinnah Avenue area, Karachi</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-5 glass-card rounded-2xl border-slate-100 hover:border-primary/20 transition-all duration-300">
                                <div className="p-3 rounded-xl bg-blue-100 text-blue-500">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Fleet Coverage</h4>
                                    <p className="text-sm text-slate-500">Malir, Gulshan, Johar, North Karachi & beyond</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Container */}
                    <div className="lg:w-1/2 w-full h-[450px] rounded-[40px] overflow-hidden shadow-2xl shadow-primary/10 border-8 border-white relative group">
                        <MapContainer
                            center={position}
                            zoom={13}
                            scrollWheelZoom={false}
                            className="w-full h-full z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={position} icon={customIcon}>
                                <Popup>
                                    <div className="p-2 text-center">
                                        <h3 className="font-black text-primary">Orderker Malir Hub</h3>
                                        <p className="text-slate-500 text-sm">Delivery Center #01</p>
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>

                        {/* Overlay Gradient for high-end look */}
                        <div className="absolute inset-0 pointer-events-none border-[12px] border-white/50 rounded-[40px] z-10" />
                    </div>
                </div>
            </div>
        </section>
    );
}
