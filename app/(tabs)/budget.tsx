import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { BadgeCheck, Flower, Camera, Utensils, MapPin, FileText, Calendar, Users, Sparkles, Send, List, Gift, Music, Scissors, Wine, Car } from 'lucide-react-native';
import { fetchBudgetDashboardData, generateBudgetMatch, fetchCitiesData, fetchUserPreferences } from '../../services/api';
import { FormInput } from '../../components/ui/FormInput';
import { FormDropdown } from '../../components/ui/FormDropdown';
import { CalendarModal } from '../../components/ui/CalendarModal';
import { CityPickerModal, CityEntry } from '../../components/ui/CityPickerModal';
import { VendorPackSection } from '../../components/vendor/VendorPackSection';
import { VendorServiceCard } from '../../components/vendor/VendorServiceCard';

// Event types for the dropdown
const EVENT_TYPES = [
  'Wedding', 'Engagement', 'Reception', 'Sangeet / Mehendi', 
  'Birthday', 'Anniversary', 'Corporate Event', 'Other'
];

// ---- Pie Chart (with rounded percentages) ----
const PieChart = ({ data, size = 260 }: { data: any, size?: number }) => {
  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  let currentAngle = -90;

  const createArc = (startAngle: number, endAngle: number) => {
    const startX = (cx + radius * Math.cos((startAngle * Math.PI) / 180)).toFixed(2);
    const startY = (cy + radius * Math.sin((startAngle * Math.PI) / 180)).toFixed(2);
    const endX = (cx + radius * Math.cos((endAngle * Math.PI) / 180)).toFixed(2);
    const endY = (cy + radius * Math.sin((endAngle * Math.PI) / 180)).toFixed(2);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    // Fallback: If percentages sum to 100 exactly for exactly one slice
    if (endAngle - startAngle >= 359.9) {
      return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius} Z`;
    }

    return `M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  const arcs = data.map((item: any, index: number) => {
    const pct = Math.round(item.percent);
    if (pct <= 0) return null;
    const angle = (pct / 100) * 360;
    const endAngle = currentAngle + angle;
    const path = createArc(currentAngle, endAngle);
    const labelRadius = pct <= 12 ? radius * 0.78 : radius * 0.62;
    const midAngle = currentAngle + angle / 2;
    const labelX = cx + labelRadius * Math.cos((midAngle * Math.PI) / 180);
    const labelY = cy + labelRadius * Math.sin((midAngle * Math.PI) / 180);
    currentAngle = endAngle;
    const isLarge = pct >= 25;

    return (
      <G key={index}>
        <Path d={path} fill={item.color} stroke="#FFFFFF" strokeWidth="0.5" />
        <SvgText x={labelX} y={labelY - 5} fill={isLarge ? "white" : "#311821"} fontSize="11" fontWeight="700" textAnchor="middle">{`${pct}%`}</SvgText>
        <SvgText x={labelX} y={labelY + 9} fill={isLarge ? "white" : "#311821"} fontSize="9" fontWeight="500" textAnchor="middle">{item.label}</SvgText>
      </G>
    );
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs}
    </Svg>
  );
};


// ---- Category → vendor key ----
const CATEGORY_VENDOR_KEY: Record<string, string> = {
  'Venue & Catering': 'Venue & Catering',
  'Decor & Lighting': 'Decor & Lighting',
  'Photography': 'Photography',
  'Attire & Makeup': 'Attire & Makeup',
  'Miscellaneous': 'Miscellaneous',
};

// ============================
//  Main Budget Screen
// ============================
export default function BudgetScreen() {
  // Budget & results
  const [budget, setBudget] = useState('0');
  const [categories, setCategories] = useState<any[]>([]);
  const [matchedVendors, setMatchedVendors] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [reasoning, setReasoning] = useState('');

  // User input fields
  const [eventType, setEventType] = useState('Wedding');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('300');
  const [city, setCity] = useState('Patiala');
  const [vibe, setVibe] = useState('Grand & Royal');
  const [description, setDescription] = useState('');

  // Modals state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citiesData, setCitiesData] = useState<CityEntry[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashData, citiesResp, prefsResp] = await Promise.all([
          fetchBudgetDashboardData(),
          fetchCitiesData(),
          fetchUserPreferences()
        ]);
        
        // Budget chart data
        setBudget(formatCurrency(dashData.totalBudget.toString()));
        setCategories(dashData.categories);
        if (dashData.matchedVendors) setMatchedVendors(dashData.matchedVendors);
        if (dashData.aiGenerated !== undefined) setAiGenerated(dashData.aiGenerated);
        if (dashData.reasoning) setReasoning(dashData.reasoning);

        // Cities
        setCitiesData(citiesResp.cities || []);

        // Prefs
        if (prefsResp) {
          setEventType(prefsResp.eventType || 'Wedding');
          setVibe(prefsResp.vibe || 'Grand & Royal');
          setGuestCount(String(prefsResp.guestCount || 300));
          setCity(prefsResp.city || 'Patiala');
          if (prefsResp.eventDate) setEventDate(prefsResp.eventDate);
          if (prefsResp.description) setDescription(prefsResp.description);
          // If total budget wasn't zeroed out in prefs, sync the budget input
          if (prefsResp.totalBudget) setBudget(formatCurrency(prefsResp.totalBudget.toString()));
        }
      } catch (e) { 
        console.error('Error loading dashboard data:', e); 
      }
      finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  const formatCurrency = (text: string) => {
    const numericStr = text.replace(/[^0-9]/g, '');
    if (!numericStr) return '';
    if (numericStr.length <= 3) return numericStr;
    const lastThree = numericStr.substring(numericStr.length - 3);
    const otherNumbers = numericStr.substring(0, numericStr.length - 3);
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ',' + lastThree;
  };

  const handleGenerate = async () => {
    const numericBudget = parseInt(budget.replace(/[^0-9]/g, ''), 10);
    if (!numericBudget || numericBudget <= 0) return;
    setIsGenerating(true);
    try {
      const result = await generateBudgetMatch({
        totalBudget: numericBudget,
        guestCount: parseInt(guestCount, 10) || 200,
        city: city || 'Unknown',
        vibe: vibe || 'Elegant',
        eventType: eventType || 'Wedding',
        description: description || '',
        date: eventDate || ''
      });
      if (result.categories) {
        setCategories(result.categories);
        if (result.matchedVendors) setMatchedVendors(result.matchedVendors);
        if (result.aiGenerated !== undefined) setAiGenerated(result.aiGenerated);
        if (result.reasoning) setReasoning(result.reasoning);
      }
    } catch (err) {
      console.error('Budget generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getVendorForCategory = (categoryName: string): string | null => {
    const key = CATEGORY_VENDOR_KEY[categoryName];
    if (!key || !matchedVendors[key]) return null;
    const vendors = matchedVendors[key];
    return vendors.length > 0 ? vendors[0].name : null;
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#FDFBF7] justify-center items-center">
        <ActivityIndicator size="large" color="#641E3D" />
        <Text className="text-[#641E3D] font-serif mt-4 text-[16px]">Loading Dashboard...</Text>
      </View>
    );
  }

  const parsedBudget = parseInt(budget.replace(/[^0-9]/g, ''), 10) || 1;
  const pieData = categories.map(cat => ({
    label: cat.name.split(' ')[0],
    percent: Math.round((cat.amount / parsedBudget) * 100),
    color: cat.color
  }));

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <View className="absolute inset-0 bg-gradient-to-b from-[#FFF2E3] to-[#FDFBF7] opacity-60" />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="items-center pt-16 px-5">
          {/* Header */}
          <Text className="text-[#641E3D] text-[22px] tracking-[1.5px] font-serif mb-5 uppercase text-center w-full">
            AI Budget Dashboard
          </Text>

          {/* ───── Budget Input ───── */}
          <Text className="text-[#4A4A4A] text-[14px] font-semibold tracking-wide mb-2 opacity-80">Total Budget:</Text>
          <View className="rounded-full px-8 py-1.5 mb-6 bg-white shadow-[0_12px_30px_rgba(210,173,107,0.18)] flex-row items-center justify-center">
            <Text className="text-[#641E3D] text-[34px] font-serif mr-1 mt-1 opacity-90">₹</Text>
            <TextInput
              className="text-[#641E3D] text-[40px] font-serif tracking-tight p-0 text-center"
              style={{ minWidth: 60, width: Math.max(60, budget.length * 22 + 5) } as any}
              value={budget}
              onChangeText={(t) => setBudget(formatCurrency(t))}
              keyboardType="number-pad"
              returnKeyType="done"
              placeholder="0"
              placeholderTextColor="#E4D1A7"
              selectionColor="#D2AD6B"
              maxLength={13}
            />
          </View>

          {/* ───── Detail Fields (light card) ───── */}
          <View className="w-full bg-white rounded-3xl p-6 mb-7 shadow-[0_10px_40px_rgba(0,0,0,0.04)] z-10">
            <Text className="text-[#D2AD6B] text-[10px] font-bold tracking-[2.5px] uppercase mb-5">Event Details</Text>

            {/* Row 1: Event Type + Vibe */}
            <View className="flex-row justify-between mb-4" style={{ zIndex: 50 }}>
              <FormDropdown
                label="Event Type"
                icon={<Sparkles size={12} color="#B8A060" />}
                width="48%"
                value={eventType}
                options={EVENT_TYPES}
                onChange={setEventType}
                placeholder="Select Type"
              />
              <FormInput
                label="Vibe / Theme"
                icon={<Flower size={12} color="#B8A060" />}
                width="48%"
                value={vibe}
                onChangeText={setVibe}
                placeholder="Grand & Royal"
              />
            </View>

            {/* Row 2: Date + Guest Count */}
            <View className="flex-row justify-between mb-4 z-10">
              <FormInput
                label="Event Date"
                icon={<Calendar size={12} color="#B8A060" />}
                width="48%"
                value={eventDate}
                placeholder="DD/MM/YYYY"
                isReadOnly
                onPress={() => setShowDatePicker(true)}
              />
              <FormInput
                label="Guest Count"
                icon={<Users size={12} color="#B8A060" />}
                width="48%"
                value={guestCount}
                onChangeText={setGuestCount}
                placeholder="300"
                keyboardType="number-pad"
              />
            </View>

            {/* Row 3: City */}
            <View className="flex-row justify-between mb-4 z-10">
              <FormInput
                label="City / Nearby"
                icon={<MapPin size={12} color="#B8A060" />}
                width="48%"
                value={city}
                placeholder="Select City"
                isReadOnly
                onPress={() => setShowCityPicker(true)}
              />
              <View style={{ width: '48%' }} />
            </View>
          </View>

          {/* Description Box */}
          <View className="w-full mb-6">
            <View className="flex-row items-center mb-1.5 ml-1">
              <FileText size={12} color="#B8A060" />
              <Text className="text-[#D2AD6B] text-[9px] font-bold tracking-[2px] uppercase ml-2">
                Preferences & Notes
              </Text>
            </View>
            <View className="bg-white rounded-2xl px-5 pt-4 pb-3 shadow-[0_8px_25px_rgba(0,0,0,0.04)]">
              <TextInput
                className="text-[#333] text-[13px] leading-5 p-0"
                style={{ minHeight: 60, textAlignVertical: 'top', outline: 'none' } as any}
                value={description}
                onChangeText={setDescription}
                placeholder="Grand royal theme, focus more on decor, outdoor venues, premium photographer..."
                placeholderTextColor="#C4B99A"
                multiline
                numberOfLines={3}
                maxLength={300}
                selectionColor="#D2AD6B"
              />
              <View className="flex-row justify-between items-center mt-1 mb-0.5">
                <Text className="text-[#C4B99A] text-[9px] tracking-wide">AI will optimize based on your notes</Text>
                <Text className="text-[#C4B99A] text-[9px]">{description.length}/300</Text>
              </View>
            </View>
          </View>

          {/* ───── GO Button ───── */}
          <TouchableOpacity
            className="w-full flex-row items-center justify-center py-4 rounded-2xl mb-6 active:opacity-80"
            style={{ backgroundColor: isGenerating ? '#9E5070' : '#78123C' }}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white text-[13px] font-bold tracking-[1px] uppercase ml-3">
                  AI Analyzing...
                </Text>
              </>
            ) : (
              <>
                <Send size={16} color="#fff" strokeWidth={2.5} />
                <Text className="text-white text-[13px] font-bold tracking-[1px] uppercase ml-2.5">
                  Generate AI Budget
                </Text>
              </>
            )}
          </TouchableOpacity>

          {isGenerating && (
            <View className="flex-row items-center justify-center bg-white shadow-[0_5px_15px_rgba(210,173,107,0.2)] px-6 py-3 rounded-full mb-8">
              <ActivityIndicator size="small" color="#78123C" />
              <Text className="text-[#78123C] text-[10px] font-bold tracking-[1.5px] uppercase ml-2.5">
                RAG Agent recalculating optimal vendors...
              </Text>
            </View>
          )}

          {/* ───── Results Section ───── */}
          <View className="w-full items-center" style={{ opacity: isGenerating ? 0.3 : 1 }}>
            {/* Pie Chart */}
            <View className="mb-8 w-full items-center justify-center">
              <PieChart data={pieData} size={250} />
            </View>

            {/* AI Status Badge */}
            {reasoning ? (
              <View className="w-full bg-[#FEF9EF] border border-[#E8DCC8] rounded-2xl px-4 py-3 mb-6">
                <View className="flex-row items-center mb-1">
                  <Sparkles size={11} color="#9A8F65" />
                  <Text className="text-[#9A8F65] text-[9px] font-bold tracking-[1.5px] uppercase ml-1.5">
                    {aiGenerated ? 'AI-Powered Breakdown' : 'Smart Calculation'}
                  </Text>
                </View>
                <Text className="text-[#7A6E50] text-[11px] leading-4">{reasoning}</Text>
              </View>
            ) : null}

            {/* Vendor Cards Grid */}
            <View className="flex-row flex-wrap justify-between w-full">
              {categories.map((cat, idx) => {
                const vendorName = getVendorForCategory(cat.name);
                return (
                  <VendorServiceCard
                    key={cat.id || idx}
                    category={cat.name}
                    amount={cat.amount}
                    vendorName={vendorName}
                    variant="grid"
                    onActionPress={() => {
                      // Action for changing vendor
                    }}
                  />
                );
              })}
            </View>

            {/* Vendor Packs Selection */}
            <VendorPackSection 
              budget={parsedBudget} 
              guestCount={parseInt(guestCount, 10) || 1}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <CalendarModal 
        visible={showDatePicker}
        currentDate={new Date().toISOString().split('T')[0]}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={(dateStr, formattedDate) => {
          setEventDate(formattedDate);
          setShowDatePicker(false);
        }}
      />

      <CityPickerModal 
        visible={showCityPicker}
        cities={citiesData}
        onClose={() => setShowCityPicker(false)}
        onSelect={(selectedCity) => {
          setCity(selectedCity);
          setShowCityPicker(false);
        }}
      />
    </View>
  );
}

// Removed FieldBlock and EventTypePicker components as we are now using InfoCard
// Removed local VendorCard implementation (now using VendorServiceCard)
