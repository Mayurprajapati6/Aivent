import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { State, City } from "country-state-city";
import { useAuth } from "../hooks/useAuth";
import { eventAPI } from "../services/api";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Event } from "../types";

export default function SearchLocationBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState(user?.location?.state || "");
  const [selectedCity, setSelectedCity] = useState(user?.location?.city || "");
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [showResults, setShowResults] = useState(false);

  const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);

  const cities = useMemo(() => {
    if (!selectedState) return [];
    const state = indianStates.find((s) => s.name === selectedState);
    if (!state) return [];
    return City.getCitiesOfState("IN", state.isoCode);
  }, [selectedState, indianStates]);

  useEffect(() => {
    const searchEvents = async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const response = await eventAPI.getEvents({ search: searchQuery, limit: 5 });
          setSearchResults(response.data);
          setShowResults(true);
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        setShowResults(false);
      }
    };

    

    const timeoutId = setTimeout(searchEvents, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLocationSelect = (city: string, state: string) => {
    const slug = `${city.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase().replace(/\s+/g, "-")}`;
    navigate(`/explore/${slug}`);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search Bar */}
      <div className="relative flex-1">
        
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          className="pl-10 w-full h-9 cursor-text"
        />
        {showResults && (
          <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((event) => (
                <button
                  key={event._id}
                  onClick={() => {
                    navigate(`/events/${event.slug}`);
                    setShowResults(false);
                  }}
                  className="w-full px-4 py-3 hover:bg-muted/50 text-left transition-colors cursor-pointer"
                >
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.city}</p>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No events found for{" "}
                <span className="font-medium">"{searchQuery}"</span>. Try a
                different keyword or city.
              </div>
            )}
          </div>
        )}
      </div>

      {/* State Select */}
      <Select
        value={selectedState}
        onValueChange={(value) => {
          setSelectedState(value);
          setSelectedCity("");
        }}
      >
        <SelectTrigger className="w-32 h-9 cursor-pointer" >
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent className="bg-gray-700 ">
          {indianStates.map((state) => (
            <SelectItem key={state.isoCode} value={state.name} className="cursor-pointer hover:bg-gray-900">
              {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* City Select */}
      <Select
        value={selectedCity}
        onValueChange={(value) => {
          setSelectedCity(value);
          if (value && selectedState) {
            handleLocationSelect(value, selectedState);
          }
        }}
        disabled={!selectedState}
      >
        <SelectTrigger className="w-32 h-9 cursor-pointer" >
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent className="bg-gray-700 ">
          {cities.map((city) => (
            <SelectItem key={city.name} value={city.name} className="cursor-pointer hover:bg-gray-900">
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

