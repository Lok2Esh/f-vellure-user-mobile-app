import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SearchX, Send, Wrench } from 'lucide-react-native';
import { PriceDisplay } from '../ui/PriceDisplay';
import { VellureSearchInput } from '../ui/VellureInputField';
import { VellureButton } from '../ui/VellureControls';

export type VendorServiceRecord = {
  id?: string;
  name: string;
  price?: number;
  priceType?: string;
  description?: string;
};

type VendorServiceCatalogProps = {
  services: VendorServiceRecord[];
  onEnquire: (service: VendorServiceRecord) => void;
  searchThreshold?: number;
};

export function VendorServiceCatalog({ services, onEnquire, searchThreshold = 6 }: VendorServiceCatalogProps) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredServices = useMemo(() => {
    if (!normalizedQuery) return services;
    return services.filter((service) =>
      `${service.name} ${service.description || ''} ${service.priceType || ''}`.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery, services]);
  const showSearch = services.length >= searchThreshold;

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.eyebrow}>Service Catalog</Text>
          <Text style={styles.heading}>Available Services ({services.length})</Text>
        </View>
        {showSearch && normalizedQuery ? <Text style={styles.resultCount}>{filteredServices.length} found</Text> : null}
      </View>

      {showSearch ? (
        <VellureSearchInput
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search services by name or details"
          accessibilityLabel="Search this vendor's services"
          containerStyle={styles.search}
        />
      ) : null}

      {!services.length ? (
        <View style={styles.emptyCard}>
          <Wrench size={28} color="#D2AD6B" />
          <Text style={styles.emptyTitle}>No services published</Text>
          <Text style={styles.emptyCopy}>This vendor has not published any services yet.</Text>
        </View>
      ) : !filteredServices.length ? (
        <View style={styles.emptyCard}>
          <SearchX size={28} color="#D2AD6B" />
          <Text style={styles.emptyTitle}>No matching services</Text>
          <Text style={styles.emptyCopy}>Try another service name or clear the search to view all {services.length} services.</Text>
          <VellureButton variant="outline" onPress={() => setQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear Search</Text>
          </VellureButton>
        </View>
      ) : filteredServices.map((service, index) => (
        <View key={service.id || `${service.name}-${index}`} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceTitle}>{service.name}</Text>
            <PriceDisplay price={service.price} priceType={service.priceType} size="medium" />
          </View>
          {service.description ? <Text style={styles.serviceDescription}>{service.description}</Text> : null}
          <VellureButton style={styles.enquireButton} onPress={() => onEnquire(service)} activeOpacity={0.8}>
            <Send size={11} color="#641E3D" />
            <Text style={styles.enquireText}>Enquire on this Service</Text>
          </VellureButton>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, marginBottom: 9 },
  eyebrow: { color: '#9A7634', fontSize: 8, fontWeight: '900', letterSpacing: 0.7, textTransform: 'uppercase' },
  heading: { marginTop: 2, color: '#2D2025', fontSize: 15, fontWeight: '900' },
  resultCount: { color: '#641E3D', fontSize: 10, fontWeight: '800' },
  search: { marginBottom: 12 },
  serviceCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#EFE3CF', marginBottom: 10 },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  serviceTitle: { flex: 1, color: '#2D2025', fontSize: 13, fontWeight: '900' },
  serviceDescription: { color: '#786B70', fontSize: 11, lineHeight: 16, marginBottom: 10 },
  enquireButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FAF5EC', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, gap: 4, borderWidth: 1, borderColor: '#EFE3CF' },
  enquireText: { color: '#641E3D', fontSize: 10, fontWeight: '800' },
  emptyCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22, borderWidth: 1, borderColor: '#EFE3CF' },
  emptyTitle: { marginTop: 8, color: '#2D2025', fontSize: 13, fontWeight: '900' },
  emptyCopy: { marginTop: 4, color: '#786B70', fontSize: 11, lineHeight: 16, textAlign: 'center' },
  clearButton: { marginTop: 12 },
  clearButtonText: { color: '#641E3D', fontSize: 11, fontWeight: '800' },
});
