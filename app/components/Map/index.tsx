import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-xl animate-pulse">Loading Map...</div>,
});

export default Map;
