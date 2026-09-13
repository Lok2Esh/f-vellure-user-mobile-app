import React, { useMemo, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Check, Circle, Plus } from 'lucide-react-native';
import { colors, typography } from '../constants/theme';
import { LuxuryCard, LuxuryScreen, PrimaryPill, ProgressBar, ScreenHeader } from '../components/ui/LuxuryLayout';
import { VellureButton } from '../components/ui/VellureControls';

type Filter = 'All Tasks' | 'In Progress' | 'Completed';

const initialTasks = [
  { id: 1, title: 'Finalize venue', date: 'Tue, 12 Aug', group: 'Planning', done: true },
  { id: 2, title: 'Book photographer', date: 'Fri, 16 Aug', group: 'Vendors', done: false },
  { id: 3, title: 'Send save the dates', date: 'Mon, 25 Aug', group: 'Planning', done: false },
  { id: 4, title: 'Plan mehendi decor', date: 'Fri, 5 Sep', group: 'Ceremony', done: false },
  { id: 5, title: 'Finalize bridal outfits', date: 'Fri, 3 Oct', group: 'Ceremony', done: false },
  { id: 6, title: 'Confirm entertainment', date: 'Mon, 13 Oct', group: 'Vendors', done: false },
];

export default function ChecklistScreen() {
  const [filter, setFilter] = useState<Filter>('All Tasks');
  const [tasks] = useState(initialTasks);
  const completed = tasks.filter((task) => task.done).length;
  const progress = Math.round((completed / tasks.length) * 100);
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === 'Completed') return task.done;
    if (filter === 'In Progress') return !task.done;
    return true;
  }), [filter, tasks]);

  return (
    <LuxuryScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Wedding Checklist" subtitle="One thoughtful step at a time." />

      <View style={styles.tabs}>
        {(['All Tasks', 'In Progress', 'Completed'] as Filter[]).map((item) => (
          <VellureButton key={item} style={[styles.tab, filter === item && styles.tabActive]} onPress={() => setFilter(item)}>
            <Text style={[styles.tabText, filter === item && styles.tabTextActive]}>{item}</Text>
          </VellureButton>
        ))}
      </View>

      <LuxuryCard style={styles.progressCard}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressNumber}>{progress}%</Text>
        </View>
        <View style={styles.progressTextWrap}>
          <Text style={styles.progressTitle}>{completed} of {tasks.length} tasks completed</Text>
          <Text style={styles.progressSubtitle}>You’re on track. Keep going.</Text>
          <ProgressBar value={progress} style={styles.progressBar} />
        </View>
      </LuxuryCard>

      <View style={styles.filterChips}>
        {['All', 'Planning', 'Vendors', 'Ceremony'].map((chip, index) => (
          <View key={chip} style={[styles.chip, index === 0 && styles.chipActive]}>
            <Text style={[styles.chipText, index === 0 && styles.chipTextActive]}>{chip}</Text>
          </View>
        ))}
      </View>

      <LuxuryCard style={styles.taskList}>
        {visibleTasks.map((task, index) => (
          <VellureButton
            key={task.id}
            style={[styles.taskRow, index === visibleTasks.length - 1 && styles.taskRowLast]}
            onPress={() => router.push('/task-detail')}
          >
            <View style={[styles.checkCircle, task.done && styles.checkCircleDone]}>
              {task.done ? <Check size={14} color="#FFFFFF" strokeWidth={2.7} /> : <Circle size={8} color="transparent" />}
            </View>
            <View style={styles.taskCopy}>
              <Text style={[styles.taskTitle, task.done && styles.taskDone]}>{task.title}</Text>
              <Text style={styles.taskGroup}>{task.group}</Text>
            </View>
            <View style={styles.taskDateWrap}>
              <CalendarDays size={12} color={colors.goldDark} />
              <Text style={styles.taskDate}>{task.date}</Text>
            </View>
          </VellureButton>
        ))}
        {visibleTasks.length === 0 ? <Text style={styles.empty}>No tasks in this view yet.</Text> : null}
      </LuxuryCard>

      <PrimaryPill label="Add New Task" icon={<Plus size={18} color="#FFFFFF" />} style={styles.addButton} />
    </LuxuryScreen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 18, backgroundColor: colors.surfaceMuted },
  tab: { flex: 1, minHeight: 37, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 10.5, fontWeight: '600' },
  tabTextActive: { color: colors.textInverse },
  progressCard: { marginTop: 14, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 14 },
  progressCircle: { width: 66, height: 66, borderRadius: 33, borderWidth: 7, borderColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  progressNumber: { color: colors.primary, fontFamily: typography.serif, fontSize: 18 },
  progressTextWrap: { flex: 1 },
  progressTitle: { color: colors.textPrimary, fontFamily: typography.serif, fontSize: 15 },
  progressSubtitle: { color: colors.textSecondary, fontSize: 10.5, marginTop: 3 },
  progressBar: { marginTop: 10 },
  filterChips: { flexDirection: 'row', gap: 7, marginVertical: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 15, backgroundColor: colors.blushLight },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 10 },
  chipTextActive: { color: colors.textInverse },
  taskList: { overflow: 'hidden' },
  taskRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 13, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  taskRowLast: { borderBottomWidth: 0 },
  checkCircle: { width: 23, height: 23, borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkCircleDone: { backgroundColor: colors.primary },
  taskCopy: { flex: 1 },
  taskTitle: { color: colors.textPrimary, fontSize: 12.5, fontWeight: '500' },
  taskDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  taskGroup: { color: colors.textMuted, fontSize: 9.5, marginTop: 3 },
  taskDateWrap: { alignItems: 'flex-end', gap: 3 },
  taskDate: { color: colors.textSecondary, fontSize: 9.5 },
  empty: { padding: 28, color: colors.textSecondary, textAlign: 'center' },
  addButton: { marginTop: 16 },
});
