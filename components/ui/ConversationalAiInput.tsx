import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Sparkles, Mic, Wand2 } from 'lucide-react-native';

export interface AiSuggestion {
  id: string;
  title: string;
  prompt: string;
  eventType: string;
  city: string;
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  services: string[];
  theme: string;
}

export const QUICK_SUGGESTIONS: AiSuggestion[] = [
  {
    id: 'sug-1',
    title: 'Outdoor Engagement with Live Music (₹4L)',
    prompt: 'Outdoor engagement in Patiala for 150 guests with catering, decor, photography, and live music. Budget ₹4 lakh.',
    eventType: 'Engagement',
    city: 'Patiala',
    guestCount: 150,
    budgetMin: 350000,
    budgetMax: 400000,
    services: ['Venue & Catering', 'Decor & Lighting', 'Photography', 'Entertainment'],
    theme: 'Rustic Floral & Garden',
  },
  {
    id: 'sug-2',
    title: 'Royal Wedding in Patiala (₹25L)',
    prompt: 'Royal Wedding in Patiala for 300 guests with luxury venue, catering, decor, cinematic photo and priest. Budget ₹25 lakh.',
    eventType: 'Wedding',
    city: 'Patiala',
    guestCount: 300,
    budgetMin: 2000000,
    budgetMax: 2500000,
    services: ['Venue & Catering', 'Decor & Lighting', 'Photography', 'Attire & Makeup', 'Miscellaneous'],
    theme: 'Grand & Royal',
  },
  {
    id: 'sug-3',
    title: 'Grand Sangeet & DJ Night (₹3.5L)',
    prompt: 'Grand Sangeet and Mehendi night for 200 guests with DJ, sound, thematic lighting, and catering under ₹3.5 Lakh.',
    eventType: 'Sangeet / Mehendi',
    city: 'Patiala',
    guestCount: 200,
    budgetMin: 300000,
    budgetMax: 350000,
    services: ['Venue & Catering', 'Decor & Lighting', 'Attire & Makeup'],
    theme: 'Vibrant Punjabi Folk',
  },
  {
    id: 'sug-4',
    title: 'Traditional Puja & Path (₹1.5L)',
    prompt: 'Traditional Vedic Puja & Path ceremony for 100 guests with Pandit ji, floral mandap, and pure vegetarian feast. Budget ₹1.5 Lakh.',
    eventType: 'Puja / Path',
    city: 'Patiala',
    guestCount: 100,
    budgetMin: 100000,
    budgetMax: 150000,
    services: ['Decor & Lighting', 'Venue & Catering', 'Miscellaneous'],
    theme: 'Spiritual & Traditional',
  },
  {
    id: 'sug-5',
    title: 'Milestone Birthday Party (₹1.5L)',
    prompt: 'Themed birthday party for 80 guests with banquet hall, designer cake, photo booth and DJ under ₹1.5 Lakh.',
    eventType: 'Birthday',
    city: 'Patiala',
    guestCount: 80,
    budgetMin: 120000,
    budgetMax: 150000,
    services: ['Venue & Catering', 'Decor & Lighting', 'Photography'],
    theme: 'Contemporary Chic',
  },
  {
    id: 'sug-6',
    title: 'Corporate Dinner & Gala (₹3L)',
    prompt: 'Annual corporate summit dinner for 150 guests with AV setup, buffet catering and conference hall. Budget ₹3 Lakh.',
    eventType: 'Corporate Event',
    city: 'Patiala',
    guestCount: 150,
    budgetMin: 250000,
    budgetMax: 300000,
    services: ['Venue & Catering', 'Decor & Lighting', 'Miscellaneous'],
    theme: 'Executive Formal',
  },
];

export interface AiSubmitPayload {
  prompt: string;
  eventType?: string;
  city?: string;
  guestCount?: number;
  budget?: number;
  budgetMin?: number;
  budgetMax?: number;
  theme?: string;
  services?: string[];
}

interface ConversationalAiInputProps {
  initialText?: string;
  currentCity?: string;
  onSubmit: (payload: AiSubmitPayload) => void;
}

export function ConversationalAiInput({
  initialText = '',
  currentCity = 'Patiala',
  onSubmit,
}: ConversationalAiInputProps) {
  const [prompt, setPrompt] = useState(initialText);

  const handleVoicePress = () => {
    Alert.alert(
      'Voice Planning',
      'Voice input active. Speak your event requirements, budget, guest count, and city to plan with AI.'
    );
  };

  const handleChipPress = (suggestion: AiSuggestion) => {
    setPrompt(suggestion.prompt);
    onSubmit({
      prompt: suggestion.prompt,
      eventType: suggestion.eventType,
      city: suggestion.city || currentCity,
      guestCount: suggestion.guestCount,
      budget: suggestion.budgetMax,
      budgetMin: suggestion.budgetMin,
      budgetMax: suggestion.budgetMax,
      theme: suggestion.theme,
      services: suggestion.services,
    });
  };

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      Alert.alert(
        'Describe Your Event',
        'Please share a few details about your celebration (e.g. event type, guest count, city, or budget) to plan with AI.'
      );
      return;
    }
    onSubmit({
      prompt: trimmed,
      city: currentCity,
    });
  };

  return (
    <View style={styles.card}>
      {/* Top Banner */}
      <View style={styles.topBadgeRow}>
        <View style={styles.aiBadge}>
          <Sparkles size={12} color="#D2AD6B" />
          <Text style={styles.aiBadgeText}>AI Event Curator</Text>
        </View>
        <Text style={styles.tagline}>Smart Indian Event Marketplace</Text>
      </View>

      <Text style={styles.headline}>Describe your celebration in simple words</Text>

      {/* Main Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Tell Vellure about your event, budget, guests, and city…"
          placeholderTextColor="#9A8E94"
          multiline
          numberOfLines={3}
          style={styles.textInput}
        />

        <View style={styles.inputBottomBar}>
          <TouchableOpacity
            style={styles.micBtn}
            onPress={handleVoicePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Use voice input"
          >
            <Mic size={16} color="#641E3D" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Plan my event with AI"
          >
            <Text style={styles.submitBtnText}>Plan My Event</Text>
            <Wand2 size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Suggestion Chips */}
      <Text style={styles.suggestionTitle}>Or try a popular event blueprint:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {QUICK_SUGGESTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.chip}
            onPress={() => handleChipPress(item)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Select blueprint: ${item.title}`}
          >
            <Sparkles size={10} color="#D2AD6B" />
            <Text style={styles.chipText} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2A121E',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#4A2333',
    shadowColor: '#2A121E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 22,
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(210, 173, 107, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(210, 173, 107, 0.3)',
    gap: 4,
  },
  aiBadgeText: {
    color: '#F4D374',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tagline: {
    color: '#BBAAB2',
    fontSize: 11,
    fontWeight: '600',
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginBottom: 14,
  },
  textInput: {
    color: '#2D2025',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    minHeight: 64,
    textAlignVertical: 'top',
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  inputBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3EDE2',
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF2E4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECD8B5',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#641E3D',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  suggestionTitle: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 6,
    maxWidth: 290,
  },
  chipText: {
    color: '#F4ECEF',
    fontSize: 11,
    fontWeight: '700',
  },
});
