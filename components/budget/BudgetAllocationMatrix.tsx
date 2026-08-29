import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { IndianRupee, PieChart as PieIcon, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react-native';

export interface BudgetCategoryItem {
  id: string;
  name: string;
  amount: number;
  color: string;
  percentage?: number;
}

export interface BudgetAllocationMatrixProps {
  totalBudget: number;
  guestCount: number;
  categories: BudgetCategoryItem[];
  reasoning?: string;
  aiGenerated?: boolean;
}

export function BudgetAllocationMatrix({
  totalBudget,
  guestCount,
  categories,
  reasoning,
  aiGenerated,
}: BudgetAllocationMatrixProps) {
  const perGuest = Math.round(totalBudget / (guestCount || 1));
  const size = 180;
  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  let currentAngle = -90;

  const validCategories = (categories || []).filter((c) => c.amount > 0);

  const createArc = (startAngle: number, endAngle: number) => {
    const startX = (cx + radius * Math.cos((startAngle * Math.PI) / 180)).toFixed(2);
    const startY = (cy + radius * Math.sin((startAngle * Math.PI) / 180)).toFixed(2);
    const endX = (cx + radius * Math.cos((endAngle * Math.PI) / 180)).toFixed(2);
    const endY = (cy + radius * Math.sin((endAngle * Math.PI) / 180)).toFixed(2);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    if (endAngle - startAngle >= 359.9) {
      return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius} Z`;
    }

    return `M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <PieIcon size={12} color="#641E3D" />
          <Text style={styles.badgeText}>Smart Allocation Matrix</Text>
        </View>

        <View style={styles.perGuestPill}>
          <Text style={styles.perGuestText}>₹{perGuest.toLocaleString('en-IN')} / Guest</Text>
        </View>
      </View>

      <Text style={styles.totalBudgetHeading}>
        ₹{totalBudget.toLocaleString('en-IN')} Total Allocation
      </Text>
      <Text style={styles.subHeading}>
        Dynamic category distribution optimized for your celebration scale.
      </Text>

      {/* Chart & Summary Row */}
      <View style={styles.chartRow}>
        <View style={styles.chartContainer}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {validCategories.map((cat, idx) => {
              const pct = Math.max(1, Math.round((cat.amount / totalBudget) * 100));
              const angle = (pct / 100) * 360;
              const endAngle = currentAngle + angle;
              const path = createArc(currentAngle, endAngle);
              currentAngle = endAngle;

              return (
                <G key={idx}>
                  <Path d={path} fill={cat.color || '#641E3D'} stroke="#FFFFFF" strokeWidth="1" />
                </G>
              );
            })}
          </Svg>
        </View>

        {/* Categories Breakdown List */}
        <View style={styles.categoriesList}>
          {validCategories.map((cat) => {
            const pct = Math.round((cat.amount / totalBudget) * 100);
            return (
              <View key={cat.id} style={styles.categoryRow}>
                <View style={[styles.colorDot, { backgroundColor: cat.color || '#641E3D' }]} />
                <View style={styles.catInfo}>
                  <Text style={styles.catName} numberOfLines={1}>
                    {cat.name}
                  </Text>
                  <Text style={styles.catAmount}>
                    ₹{(cat.amount / 100000).toFixed(2)}L ({pct}%)
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Reasoning Note */}
      {reasoning ? (
        <View style={styles.reasoningBox}>
          <Sparkles size={12} color="#8A6A23" />
          <Text style={styles.reasoningText} numberOfLines={2}>
            {reasoning}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  badgeText: {
    color: '#641E3D',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  perGuestPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  perGuestText: {
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '800',
  },
  totalBudgetHeading: {
    color: '#2D2025',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  subHeading: {
    color: '#786B70',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesList: {
    flex: 1,
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    color: '#2D2025',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    marginRight: 4,
  },
  catAmount: {
    color: '#641E3D',
    fontSize: 11,
    fontWeight: '900',
  },
  reasoningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  reasoningText: {
    color: '#4A3E44',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
    lineHeight: 14,
  },
});
