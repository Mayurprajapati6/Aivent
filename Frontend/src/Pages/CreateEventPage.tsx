import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { State, City } from "country-state-city";
import { CalendarIcon, Loader2, Sparkles } from "lucide-react";
import { eventAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import UnsplashImagePicker from "../components/events/UnsplashImagePicker";
import AIEventCreator from "../components/events/AIEventCreator";
import UpgradeModal from "../components/UpgradeModal";
import { CATEGORIES } from "../lib/data";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  startTime: z.string().regex(timeRegex, "Start time must be HH:MM"),
  endTime: z.string().regex(timeRegex, "End time must be HH:MM"),
  locationType: z.enum(["physical", "online"]).default("physical"),
  venue: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  ticketType: z.enum(["free", "paid"]).default("free"),
  ticketPrice: z.number().optional(),
  coverImage: z.string().optional(),
  themeColor: z.string().default("#1e3a8a"),
});

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"limit" | "color">("limit");
  const [loading, setLoading] = useState(false);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");
  const containerRef = useRef<HTMLDivElement>(null);

  const hasPro = false; // TODO: Implement Pro plan check

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      locationType: "physical",
      ticketType: "free",
      capacity: 50,
      themeColor: "#1e3a8a",
      category: "",
      state: "",
      city: "",
      startTime: "",
      endTime: "",
    },
  });

  const themeColor = watch("themeColor");
  const ticketType = watch("ticketType");
  const selectedState = watch("state");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const coverImage = watch("coverImage");
  const venueLink = watch("venue");

  const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);

  const cities = useMemo(() => {
    if (!selectedState) return [];
    const st = indianStates.find((s) => s.name === selectedState);
    if (!st) return [];
    return City.getCitiesOfState("IN", st.isoCode);
  }, [selectedState, indianStates]);

  const colorPresets = [
    "#1e3a8a",
    ...(hasPro ? ["#4c1d95", "#065f46", "#92400e", "#7f1d1d", "#831843"] : []),
  ];

  const handleColorClick = (color: string) => {
    if (color !== "#1e3a8a" && !hasPro) {
      setUpgradeReason("color");
      setShowUpgradeModal(true);
      return;
    }
    setValue("themeColor", color);
  };

  const normalizeTimeWithPeriod = (time: string, period: "AM" | "PM") => {
    console.log("🕐 Normalizing time:", { time, period });
    
    if (!time) {
      console.error("❌ Time is empty");
      return "";
    }
    
    let [hours, minutes] = time.split(":").map(Number);
    
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      console.error("❌ Invalid time format:", { hours, minutes });
      return "";
    }
    
    if (period === "PM" && hours < 12) {
      hours += 12;
    }
    if (period === "AM" && hours === 12) {
      hours = 0;
    }
    
    const normalized = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    console.log("✅ Normalized time:", normalized);
    return normalized;
  };

  const combineDateTime = (date: Date | undefined, time: string) => {
    console.log("📅 Combining date and time:", { date, time });
    
    if (!date || !time) {
      console.error("❌ Missing date or time:", { date, time });
      return null;
    }
    
    const [hh, mm] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(hh, mm, 0, 0);
    
    console.log("✅ Combined datetime:", d);
    return d;
  };

  const onSubmit = async (data: z.infer<typeof eventSchema>) => {
    console.log("🚀 Form submission started");
    console.log("📋 Form data:", data);
    console.log("🔍 Validation errors:", errors);
    
    try {
      // Check event limit for Free users (3 free events trial)
      if (!hasPro && (user?.freeEventsCreated || 0) >= 3) {
        console.log("⚠️ Event limit reached");
        setUpgradeReason("limit");
        setShowUpgradeModal(true);
        return;
      }

      if (data.themeColor !== "#1e3a8a" && !hasPro) {
        console.log("⚠️ Pro color selected without Pro plan");
        setUpgradeReason("color");
        setShowUpgradeModal(true);
        return;
      }

      const formattedStartTime = normalizeTimeWithPeriod(data.startTime, startPeriod);
      const formattedEndTime = normalizeTimeWithPeriod(data.endTime, endPeriod);

      console.log("⏰ Formatted times:", { formattedStartTime, formattedEndTime });

      const start = combineDateTime(data.startDate, formattedStartTime);
      const end = combineDateTime(data.endDate, formattedEndTime);

      if (!start || !end) {
        console.error("❌ Failed to combine date and time");
        toast.error("Please select both date and time for start and end.");
        return;
      }

      if (end.getTime() <= start.getTime()) {
        console.error("❌ End time is before or equal to start time");
        toast.error("End date/time must be after start date/time.");
        return;
      }

      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        tags: [data.category],
        startDate: start.getTime(),
        endDate: end.getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locationType: data.locationType,
        venue: data.venue || undefined,
        address: data.address || undefined,
        city: data.city,
        state: data.state || undefined,
        country: "India",
        capacity: data.capacity,
        ticketType: data.ticketType,
        ticketPrice: data.ticketPrice || undefined,
        coverImage: data.coverImage || undefined,
        themeColor: data.themeColor,
      };

      console.log("📤 Sending payload:", payload);
      setLoading(true);
      
      const response = await eventAPI.createEvent(payload);
      console.log("✅ Event created successfully:", response);

      toast.success("Event created successfully! 🎉");

      if (user) {
        updateUser({
          freeEventsCreated: (user.freeEventsCreated || 0) + 1,
        });
      }

      navigate("/my-events");
    } catch (error: any) {
      console.error("❌ Error creating event:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
      console.log("🏁 Form submission completed");
    }
  };

  // Log validation errors whenever they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("⚠️ Form validation errors:", errors);
    }
  }, [errors]);

  const handleAIGenerate = (generatedData: any) => {
    setValue("title", generatedData.title);
    setValue("description", generatedData.description);
    setValue("category", generatedData.category);
    setValue("capacity", generatedData.suggestedCapacity);
    setValue("ticketType", generatedData.suggestedTicketType);
    toast.success("Event details filled! Customize as needed.");
  };

  // Update CSS variable when theme color changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty("--theme-color", themeColor || "#1e3a8a");
    }
  }, [themeColor]);

  const computedMapsHref = useMemo(() => {
    if (!venueLink) return null;
    if (/^https?:\/\//i.test(venueLink)) {
      return venueLink;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueLink)}`;
  }, [venueLink]);

  // Add a click handler to debug button clicks
  const handleFormSubmit = () => {
    console.log("🖱️ Form submit button clicked");
    console.log("📝 Current form values:", watch());
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen transition-colors duration-300 px-2 sm:px-4 pt-4 sm:pt-6 pb-8 sm:pb-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    >
      <div className="max-w-7xl mx-auto bg-background/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl sm:rounded-3xl shadow-2xl px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 space-y-6 sm:space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row justify-between items-start md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-400 mb-2">
              Host with Aivent
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
              Create a memorable event
            </h1>
            {!hasPro && (
              <p className="text-sm text-muted-foreground mt-2">
                Free trial:{" "}
                <span className="font-medium text-purple-300">
                  {user?.freeEventsCreated || 0}/3
                </span>{" "}
                events created
              </p>
            )}
          </div>
          <AIEventCreator onEventGenerated={handleAIGenerate} />
        </div>

        <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 md:gap-8 lg:gap-10">
        {/* LEFT: Image + Theme */}
        <div className="space-y-6">
          <div
            className="aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer border border-dashed border-purple-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 hover:border-purple-400/70 transition-colors"
            onClick={() => setShowImagePicker(true)}
          >
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <span className="opacity-60 text-sm">Click to add cover image</span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Theme Color</Label>
              {!hasPro && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Sparkles className="w-3 h-3" />
                  Pro
                </Badge>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Select theme color ${color}`}
                  title={`Select theme color ${color}${!hasPro && color !== "#1e3a8a" ? " (Pro feature)" : ""}`}
                  className={`w-10 h-10 rounded-full border-2 transition-all color-picker-button shadow-md shadow-black/40 ${
                    !hasPro && color !== "#1e3a8a"
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:scale-110 cursor-pointer"
                  } ${themeColor === color ? "border-white" : "border-transparent"}`}
                  data-button-color={color}
                  onClick={() => handleColorClick(color)}
                />
              ))}
              {!hasPro && (
                <button
                  type="button"
                  aria-label="Upgrade to Pro for more theme colors"
                  title="Upgrade to Pro for more theme colors"
                  onClick={() => {
                    setUpgradeReason("color");
                    setShowUpgradeModal(true);
                  }}
                  className="w-10 h-10 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center hover:border-purple-500 transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("❌ Form validation failed:", errors);
          toast.error("Please fill all required fields correctly");
        })} onClick={handleFormSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <Input
              {...register("title")}
              placeholder="Event Name"
              className="text-xl sm:text-2xl md:text-3xl font-semibold bg-transparent text-white border-none focus-visible:ring-0 placeholder:text-muted-foreground/70 pl-0.5 w-full"
            />
            {errors.title && (
              <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-sm">Start</Label>
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center w-full">
                <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-sm sm:text-base cursor-pointer" type="button">
                      {startDate ? format(startDate, "PPP") : "Pick date"}
                      <CalendarIcon className="w-4 h-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-gray-700 " >
                    <Calendar
                      mode="single"
                      selected={startDate}
                    
                      onSelect={(date) => {
                        
                        setValue("startDate", date as Date);
                        if (date) {
                          setStartDatePickerOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  {...register("startTime")}
                  placeholder="hh:mm"
                  className="cursor-pointer min-w-[80px] sm:min-w-[90px] text-center text-sm sm:text-base"
                />
                <Select
                  value={startPeriod}
                  onValueChange={(value: "AM" | "PM") => setStartPeriod(value)}
                >
                  <SelectTrigger className="w-16 sm:w-20 cursor-pointer">
                    <SelectValue placeholder="AM" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700">
                    <SelectItem value="AM" className="cursor-pointer hover:bg-gray-900">AM</SelectItem>
                    <SelectItem value="PM" className="cursor-pointer hover:bg-gray-900">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.startDate && (
                <p className="text-sm text-red-400">{errors.startDate.message}</p>
              )}
              {errors.startTime && (
                <p className="text-sm text-red-400">{errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">End</Label>
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center w-full">
                <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-sm sm:text-base cursor-pointer" type="button">
                      {endDate ? format(endDate, "PPP") : "Pick date"}
                      <CalendarIcon className="w-4 h-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-gray-700 ">
                    <Calendar
                      mode="single"
                
                      selected={endDate}
                      onSelect={(date) => {
                        setValue("endDate", date as Date);
                        if (date) {
                          setEndDatePickerOpen(false);
                        }
                      }}
                      disabled={(date) => date < (startDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  {...register("endTime")}
                  placeholder="hh:mm"
                  className="cursor-pointer min-w-[80px] sm:min-w-[90px] text-center text-sm sm:text-base"
                />
                <Select
                  value={endPeriod}
                  
                  onValueChange={(value: "AM" | "PM") => setEndPeriod(value)}
                >
                  <SelectTrigger className="w-16 sm:w-20 cursor-pointer">
                    <SelectValue placeholder="AM" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700">
                    <SelectItem value="AM" className="cursor-pointer hover:bg-gray-900">AM</SelectItem>
                    <SelectItem value="PM" className="cursor-pointer hover:bg-gray-900">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.endDate && (
                <p className="text-sm text-red-400">{errors.endDate.message}</p>
              )}
              {errors.endTime && (
                <p className="text-sm text-red-400">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 ">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="cursor-pointer hover:bg-gray-900">
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-400">{errors.category.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-sm">Location</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("city", "");
                    }}
                  >
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 ">
                      {indianStates.map((s) => (
                        <SelectItem key={s.isoCode} value={s.name} className="cursor-pointer hover:bg-gray-900">
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedState}
                  >
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700">
                      {cities.map((c) => (
                        <SelectItem key={c.name} value={c.name} className="cursor-pointer hover:bg-gray-900">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {errors.city && (
              <p className="text-sm text-red-400">{errors.city.message}</p>
            )}
            <div className="space-y-2 mt-6">
              <Label className="text-sm">Venue Details</Label>
              <Input
                {...register("venue")}
                placeholder="Venue link or location"
                type="text"
                className="cursor-text"
              />
              {errors.venue && (
                <p className="text-sm text-red-400">{errors.venue.message}</p>
              )}
              {computedMapsHref && (
                <a
                  href={computedMapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-100 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Open in Google Maps
                </a>
              )}
              <Input {...register("address")} placeholder="Full address / street / building (optional)" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Tell people about your event..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Ticketing */}
          <div className="space-y-3">
            <Label className="text-sm">Tickets</Label>
            <div className="flex items-center gap-6 ">
              <label className="flex items-center gap-2">
                <input type="radio" className="cursor-pointer" value="free" {...register("ticketType")} defaultChecked /> Free
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" className="cursor-pointer" value="paid" {...register("ticketType")} /> Paid
              </label>
            </div>
            {ticketType === "paid" && (
              <Input
                type="number"
                placeholder="Ticket price ₹"
                {...register("ticketPrice", { valueAsNumber: true })}
              />
            )}
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label className="text-sm">Capacity</Label>
            <Input
              type="number"
              {...register("capacity", { valueAsNumber: true })}
              placeholder="Ex: 100"
            />
            {errors.capacity && (
              <p className="text-sm text-red-400">{errors.capacity.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer py-6 text-lg rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-white font-semibold shadow-[0_10px_30px_rgba(236,72,153,0.35)] hover:scale-[1.01] transition-transform disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
              </>
            ) : (
              "Create Event"
            )}
          </Button>
        </form>
        </div>

      {/* close inner container */}
      </div>

      {/* Unsplash Picker */}
      {showImagePicker && (
        <UnsplashImagePicker
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={(url) => {
            setValue("coverImage", url);
            setShowImagePicker(false);
          }}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger={upgradeReason}
      />
    </div>
  );
}