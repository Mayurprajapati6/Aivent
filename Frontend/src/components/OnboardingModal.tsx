import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Heart, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { State, City } from "country-state-city";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CATEGORIES } from "../lib/data";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [location, setLocation] = useState({
    state: "",
    city: "",
    country: "India",
  });
  const [loading, setLoading] = useState(false);
  const { updateUserOnServer } = useAuth();

  const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);

  const cities = useMemo(() => {
    if (!location.state) return [];
    const selectedState = indianStates.find((s) => s.name === location.state);
    if (!selectedState) return [];
    return City.getCitiesOfState("IN", selectedState.isoCode);
  }, [location.state, indianStates]);

  const toggleInterest = (categoryId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNext = async () => {
    if (step === 1 && selectedInterests.length < 3) {
      toast.error("Please select at least 3 interests");
      return;
    }
    if (step === 2 && (!location.city || !location.state)) {
      toast.error("Please select both state and city");
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateUserOnServer({
        location: {
          city: location.city,
          state: location.state,
          country: location.country,
        },
        interests: selectedInterests,
      });
      toast.success("Welcome to Spott! 🎉");
      onComplete();
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 2) * 100;

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent
      className="
        sm:max-w-2xl w-full 
        transition-all duration-500 ease-out 
        animate-in fade-in zoom-in 
        border border-gray-800 bg-gray-900/95 backdrop-blur-xl 
        shadow-xl rounded-xl
      "
    >
      <DialogHeader className="space-y-4">
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          className="mb-4"
        >
          <Progress value={progress} />
        </motion.div>

        <motion.div layout transition={{ duration: 0.25 }} className="space-y-2">
          <DialogTitle className="flex items-center gap-3 text-xl sm:text-3xl font-bold">
            {step === 1 ? (
              <>
                <Heart className="w-6 h-6 text-purple-400 animate-pulse" />
                What interests you?
              </>
            ) : (
              <>
                <MapPin className="w-6 h-6 text-purple-400 animate-pulse" />
                Where are you located?
              </>
            )}
          </DialogTitle>

          <DialogDescription className="text-sm sm:text-base">
            {step === 1
              ? "Select at least 3 categories to personalize your experience"
              : "We will show events happening near you"}
          </DialogDescription>
        </motion.div>
      </DialogHeader>

      <div className="py-4 min-h-[320px] sm:min-h-[360px] transition-all">
        
        {/* STEP 1 */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
            {/* Chip-Style Categories */}
            <motion.div 
              layout 
              className="flex flex-wrap gap-3 justify-center px-6 max-h-[360px] overflow-y-auto sm:overflow-visible"
            >
              {CATEGORIES.map((category) => {
                const isActive = selectedInterests.includes(category.id);

                return (
                  <motion.div
                    key={category.id}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => toggleInterest(category.id)}
                    className={`
                      px-4 py-2 rounded-full border cursor-pointer 
                      flex items-center gap-2 text-sm font-medium
                      transition-all duration-300
                      ${isActive 
                        ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/30"
                        : "bg-gray-800 text-gray-300 border-gray-600 hover:border-purple-400 hover:text-purple-300"
                      }
                    `}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.label}</span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Status View */}
            <div className="flex justify-center items-center gap-2">
              <Badge
                className={`
                  px-4 py-2 rounded-full font-semibold transition-all duration-300
                  ${
                    selectedInterests.length >= 3
                      ? "bg-green-600 text-white shadow-md scale-105"
                      : "bg-gray-700 text-gray-300"
                  }
                `}
              >
                {selectedInterests.length} Selected
              </Badge>

              {selectedInterests.length >= 3 ? (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-green-500">Ready to continue</span>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Select at least 3 interests</div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
  
              {/* State */}
              <div className="space-y-1">
                <Label>State</Label>
                <Select
                  value={location.state}
                  onValueChange={(value) =>
                    setLocation({ ...location, state: value, city: "" })
                  }
                >
                  <SelectTrigger className="h-11 border border-purple-500/40 text-white flex justify-between items-center px-3 cursor-pointer">
                    {location.state ? (
                      <span className="text-white font-medium">{location.state}</span>
                      ) : (
                      <span className="text-gray-400">Select state</span>
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white">
                    {indianStates.map((s) => (
                      <SelectItem 
                        key={s.isoCode} 
                        value={s.name}
                        className="hover:bg-gray-900 cursor-pointer"
                      >
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-1">
                <Label>City</Label>
                <Select
                  disabled={!location.state}
                  value={location.city}
                  onValueChange={(value) =>
                    setLocation({ ...location, city: value })
                  }
                >
                  <SelectTrigger className="h-11 border border-purple-500/40 text-white flex justify-between items-center px-3 cursor-pointer">
                    {location.city ? (
                        <span className="text-white font-medium">{location.city}</span>
                      ) : (
                      <span className="text-gray-400">
                        {location.state ? "Select city" : "Select state first"}
                      </span>
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white">
                    {cities.length === 0 ? (
                      <SelectItem disabled value="no-cities">No cities found</SelectItem>
                    ) : (
                      cities.map((c) => (
                        <SelectItem 
                          key={c.name} 
                          value={c.name}
                          className="hover:bg-gray-900 cursor-pointer"
                        >
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

            </div>



            {/* 🔥 MESSAGE LOGIC HERE — NOT INSIDE GRID */}
            {location.state && !location.city && (
              <p className="text-sm mt-2 text-purple-300 animate-in fade-in duration-200">
                You selected <span className="font-semibold">{location.state}</span> as your state
              </p>
            )}

            {location.city && !location.state && (
              <p className="text-sm mt-2 text-purple-300 animate-in fade-in duration-200">
                You selected <span className="font-semibold">{location.city}</span> as your city
              </p>
            )}


            {/* Show final location selected */}
            {location.city && location.state && (
              <motion.div
                layout
                className="p-4 rounded-lg bg-purple-700/10 border border-purple-500/30"
              >
                <div className="flex gap-2 items-start">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Your Location</p>
                    <p className="text-sm text-gray-400">
                      {location.city}, {location.state}, India
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

      </div>

      {/* Footer */}
      <motion.div layout className="flex gap-3 pt-6">
        
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="
              gap-2 border-gray-600 text-white 
              hover:border-purple-500 hover:text-purple-300 
              transition-all duration-300 cursor-pointer
            "
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
        )}

        <Button
          disabled={loading}
          onClick={handleNext}
          className="
            flex-1 gap-2 font-semibold
            border border-purple-500 bg-purple-600/90 
            hover:bg-purple-600 hover:scale-[1.02]
            transition-all duration-300
            shadow-lg shadow-purple-500/20 active:scale-95 cursor-pointer
          "
        >
          {loading ? "Completing..." : step === 2 ? "Complete Setup" : "Continue"}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </Button>

      </motion.div>
    </DialogContent>
  </Dialog>
);



}

