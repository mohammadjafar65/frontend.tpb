import { Trash } from "lucide-react";

const PackageCard = ({ pack, onDelete }) => {
    return (
        <div className="bg-white rounded-xl shadow p-2 relative">
            <img src={`/uploads/${pack.avatarImage}`} alt="" className="rounded-xl h-40 w-full object-cover" />
            <div className="absolute top-2 right-2 bg-white text-black font-semibold px-2 py-1 rounded">
                ₹{pack.packagePrice}
            </div>
            <div className="mt-2 px-2">
                <h3 className="font-bold text-sm">{pack.packageName}</h3>
                <p className="text-xs">{pack.packageDurationDate}</p>
                <div className="flex flex-wrap gap-1 text-xs my-2">
                    <span className="bg-primaryOpacity text-primary px-2 py-0.5 rounded">Food</span>
                    <span className="bg-primaryOpacity text-primary px-2 py-0.5 rounded">Hotel</span>
                    <span className="bg-primaryOpacity text-primary px-2 py-0.5 rounded">Car</span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded">+3 more</span>
                </div>
                <a href={`/packages/${pack.packageId}`} className="text-blue-500 text-sm">View Details</a>
            </div>
            <button onClick={() => onDelete(pack.packageId)} className="absolute bottom-2 right-2 text-red-500">
                <Trash size={18} />
            </button>
        </div>
    );
};

export default PackageCard;