import {
  VellureButton } from "@/components/ui/VellureControls";
import React,
  { useEffect,
  useState } from 'react';
import { ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CalendarDays, CheckCircle2, ChevronRight, FolderHeart, MapPin, X } from 'lucide-react-native';
import {
  addPlanService,
  EventPlan,
  fetchCustomerPlans,
  fetchPlanServices,
  shortlistVendorForService,
} from '../../services/api';

type Props = {
  visible: boolean;
  vendorId: string;
  vendorName: string;
  category: string;
  estimatedPrice?: number;
  onClose: () => void;
  onAdded?: (planId: string) => void;
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export function AddVendorToPlanModal({
  visible,
  vendorId,
  vendorName,
  category,
  estimatedPrice,
  onClose,
  onAdded,
}: Props) {
  const [plans, setPlans] = useState<EventPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingPlanId, setAddingPlanId] = useState<string | null>(null);
  const [addedPlanId, setAddedPlanId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError('');
    setAddedPlanId(null);
    fetchCustomerPlans()
      .then((items) => setPlans(items.filter((plan) => plan.status !== 'ARCHIVED' && plan.status !== 'CANCELLED')))
      .catch(() => setError('Your plans could not be loaded.'))
      .finally(() => setLoading(false));
  }, [visible]);

  const addToPlan = async (plan: EventPlan) => {
    setAddingPlanId(plan.id);
    setError('');
    try {
      let services = await fetchPlanServices(plan.id);
      let service = services.find((item) =>
        normalize(item.categoryKey) === normalize(category) ||
        normalize(item.categoryName).includes(normalize(category)) ||
        normalize(category).includes(normalize(item.categoryKey))
      );

      if (!service) {
        services = await addPlanService(plan.id, {
          categoryKey: category.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          categoryName: category,
          requirement: 'OPTIONAL',
          allocatedBudget: estimatedPrice || 0,
          estimatedPrice,
          notes: `${vendorName} added from Explore`,
        });
        service = services[services.length - 1];
      }

      await shortlistVendorForService(plan.id, service.id, vendorId);
      setAddedPlanId(plan.id);
      onAdded?.(plan.id);
    } catch (_) {
      setError('This partner could not be added. Please try again.');
    } finally {
      setAddingPlanId(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <FolderHeart size={19} color="#641E3D" />
              <View>
                <Text style={styles.title}>Add to an event plan</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{vendorName}</Text>
              </View>
            </View>
            <VellureButton accessibilityLabel="Close plan selector" onPress={onClose} style={styles.closeButton}>
              <X size={18} color="#641E3D" />
            </VellureButton>
          </View>

          {loading ? (
            <View style={styles.center}><ActivityIndicator color="#641E3D" /><Text style={styles.loadingText}>Loading your plans…</Text></View>
          ) : plans.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>Create a plan first</Text>
              <Text style={styles.emptyCopy}>Start an event plan in My Plans, then return to shortlist this partner.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {plans.map((plan) => {
                const added = addedPlanId === plan.id;
                return (
                  <VellureButton
                    key={plan.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${vendorName} to ${plan.name}`}
                    disabled={Boolean(addingPlanId) || added}
                    onPress={() => addToPlan(plan)}
                    style={[styles.planCard, added && styles.planCardAdded]}
                  >
                    <View style={styles.planCopy}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <View style={styles.metaRow}>
                        <MapPin size={12} color="#D2AD6B" />
                        <Text style={styles.meta}>{plan.city}</Text>
                        <CalendarDays size={12} color="#D2AD6B" />
                        <Text style={styles.meta}>{plan.eventDate || 'Flexible date'}</Text>
                      </View>
                      <Text style={styles.eventType}>{plan.eventType}</Text>
                    </View>
                    {addingPlanId === plan.id ? <ActivityIndicator color="#641E3D" size="small" /> : added ? <CheckCircle2 size={22} color="#2F7D62" /> : <ChevronRight size={19} color="#641E3D" />}
                  </VellureButton>
                );
              })}
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(31,16,23,0.55)' },
  sheet: { maxHeight: '72%', minHeight: 310, backgroundColor: '#FDFBF7', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E9DFD9' },
  headerCopy: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: '#2D2025', fontSize: 17, fontWeight: '900' },
  subtitle: { color: '#786B70', fontSize: 10, marginTop: 2, maxWidth: 260 },
  closeButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3E9E3' },
  center: { flex: 1, minHeight: 220, alignItems: 'center', justifyContent: 'center', padding: 28 },
  loadingText: { color: '#786B70', fontSize: 11, marginTop: 9 },
  emptyTitle: { color: '#2D2025', fontSize: 16, fontWeight: '900' },
  emptyCopy: { color: '#786B70', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 6 },
  list: { padding: 18, gap: 10 },
  planCard: { minHeight: 90, borderRadius: 18, borderWidth: 1, borderColor: '#E9DFD9', backgroundColor: '#FFFFFF', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  planCardAdded: { borderColor: '#A5CDBE', backgroundColor: '#F3FBF7' },
  planCopy: { flex: 1 },
  planName: { color: '#2D2025', fontSize: 14, fontWeight: '900' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  meta: { color: '#786B70', fontSize: 10, fontWeight: '700', marginRight: 4 },
  eventType: { color: '#8A6A23', fontSize: 9, fontWeight: '900', textTransform: 'uppercase', marginTop: 6 },
  error: { color: '#B63A4A', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 5 },
});
