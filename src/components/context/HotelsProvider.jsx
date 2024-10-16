import { createContext, useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import toast from "react-hot-toast";

const HotelContext = createContext();
function HotelsProvider({ children }) {
  const [currentHotel, setCurrentHotel] = useState(null);
  const [isLoadingCurrentHotel, setIsLoadingCurrentHotel] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const destination = searchParams.get("destination");
  const room = JSON.parse(searchParams.get("options"))?.room;
  const BASE_URL = "http://localhost:5000";

  const { isLoading, data: hotels } = useFetch(
    `${BASE_URL}/hotels`,
    `host_location_like=${destination || ""}&name_like=${
      destination || ""
    }&accommodates_gte=${room || 1}`
  );
  async function getSingleHotel(id) {
    setIsLoadingCurrentHotel(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/hotels/${id}`);
      setCurrentHotel(data);
      setIsLoadingCurrentHotel(false);
    } catch (error) {
      toast.error(error.message);
      setIsLoadingCurrentHotel(false);
    }
  }
  return (
    <HotelContext.Provider
      value={{
        isLoading,
        hotels,
        getSingleHotel,
        isLoadingCurrentHotel,
        currentHotel,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}

export default HotelsProvider;
export function useHotels() {
  return useContext(HotelContext);
}
