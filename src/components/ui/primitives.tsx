import type { ReactNode } from 'react';
import {
  Pressable, ScrollView, Switch as RNSwitch, Text, TextInput, View, type PressableProps, type StyleProp, type TextInputProps,
  type TextProps, type TextStyle, type ViewProps, type ViewStyle,
} from 'react-native';
import { CATEGORY_LABEL, PRIORITY_LABEL, RARITY_LABEL, type Category, type Priority, type Rarity } from '@/domain';
import { Icon, type IconName } from './Icon';
import { categoryColors, colors, fonts, giftColors, INPUT_FONT_SIZE, linear, priorityColors, radius, shadow, type as typo } from '@/theme/theme';

/** Web-only CSS properties (gradients, shadows, blur) passed through react-native-web. */
export const css = (s: Record<string, unknown>) => s as unknown as ViewStyle;

type Variant = keyof typeof typo | 'title' | 'muted';

export function T({ v = 'body', style, children, ...rest }: TextProps & { v?: Variant; children?: ReactNode }) {
  const base: TextStyle =
    v === 'title' ? typo.pageTitle : v === 'muted' ? { ...typo.small, color: colors.muted } : (typo[v as keyof typeof typo] as TextStyle);
  return <Text {...rest} style={[{ color: colors.text }, base, style]}>{children}</Text>;
}

export function Card({ title, right, children, style, padded = true, accessibilityLabel }: {
  title?: string; right?: ReactNode; children?: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean; accessibilityLabel?: string;
}) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: padded ? 16 : 0 },
        css({ ...shadow.card, backdropFilter: 'blur(8px)' }),
        style,
      ]}
    >
      {(title || right) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: padded ? 0 : 16, paddingTop: padded ? 0 : 14 }}>
          {title ? <T v="cardTitle" accessibilityRole="header">{title}</T> : <View />}
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

type BtnKind = 'primary' | 'soft' | 'ghost' | 'danger' | 'outline';

export function Button({ label, kind = 'primary', icon, small, style, disabled, ...rest }: PressableProps & { label: string; kind?: BtnKind; icon?: ReactNode; small?: boolean; style?: StyleProp<ViewStyle> }) {
    const bg: Record<BtnKind, ViewStyle> = {
      primary: css({ backgroundImage: linear(colors.accentGradient, 135), ...shadow.button }),
      soft: { backgroundColor: colors.accentSoft },
      ghost: { backgroundColor: 'transparent' },
      outline: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
      danger: { backgroundColor: '#FFE0E9' },
    };
    const fg = kind === 'primary' ? '#fff' : kind === 'danger' ? colors.danger : colors.accent;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled}
        {...rest}
        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
          {
            minHeight: small ? 36 : 44, paddingHorizontal: small ? 14 : 18, borderRadius: radius.pill, flexDirection: 'row',
            alignItems: 'center', justifyContent: 'center', gap: 6, opacity: disabled ? 0.5 : 1,
            transform: [{ scale: pressed ? 0.97 : hovered ? 1.02 : 1 }],
          },
          bg[kind],
          css({ transitionDuration: '150ms', cursor: disabled ? 'default' : 'pointer' }),
          style,
        ]}
      >
        {icon}
        <Text style={{ color: fg, fontFamily: fonts.bold, fontSize: small ? 13 : 14.5 }}>{label}</Text>
      </Pressable>
    );
}

export function IconButton({ label, onPress, children, size = 44, bg = '#fff', style }: {
  label: string; onPress?: () => void; children: ReactNode; size?: number; bg?: string; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: bg, borderWidth: 1, borderColor: colors.line, transform: [{ scale: pressed ? 0.94 : 1 }] },
        css({ ...shadow.card, cursor: 'pointer' }),
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function Pill({ text, bg, fg, style }: { text: string; bg: string; fg: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' }, style]}>
      <Text style={[typo.chip, { color: fg }]}>{text}</Text>
    </View>
  );
}

export const CategoryPill = ({ c }: { c: Category }) => <Pill text={CATEGORY_LABEL[c]} bg={categoryColors[c].bg} fg={categoryColors[c].text} />;
export const PriorityPill = ({ p }: { p: Priority }) => <Pill text={PRIORITY_LABEL[p]} bg={priorityColors[p].bg} fg={priorityColors[p].text} />;
export const RarityPill = ({ r }: { r: Rarity }) =>
  r === 'default' ? <Pill text="Bawaan" bg="#F3EEF5" fg={colors.muted} />
    // Legenda stands out: deep purple with gold text.
    : r === 'legenda' ? <Pill text={`👑 ${RARITY_LABEL[r]}`} bg="#4B4590" fg="#FFE08A" />
    : <Pill text={RARITY_LABEL[r]} bg={giftColors[r].box} fg={colors.text} />;

/** Selectable chip (filters, options). */
export function Chip({ label, selected, onPress, color, accessibilityLabel }: { label: string; selected?: boolean; onPress?: () => void; color?: { bg: string; text: string }; accessibilityLabel?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={[
        { minHeight: 36, paddingHorizontal: 14, borderRadius: radius.pill, justifyContent: 'center', borderWidth: 1 },
        selected
          ? { backgroundColor: color?.bg ?? colors.accentSoft, borderColor: color?.text ?? colors.accent }
          : { backgroundColor: '#fff', borderColor: colors.line },
        css({ cursor: 'pointer' }),
      ]}
    >
      <Text style={[typo.small, { color: selected ? color?.text ?? colors.accent : colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

/** `bare`: only the toggle (label is still announced to screen readers). */
export function Switch({ value, onValueChange, label, hint, bare }: { value: boolean; onValueChange: (v: boolean) => void; label: string; hint?: string; bare?: boolean }) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, gap: 12 }}
    >
      {!bare && (
        <View style={{ flex: 1 }}>
          <T v="body">{label}</T>
          {hint ? <T v="muted">{hint}</T> : null}
        </View>
      )}
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#EADDE3', true: '#F7A8C4' }}
        thumbColor={value ? colors.accent : '#fff'}
        {...({ activeThumbColor: colors.accent, 'aria-hidden': true, tabIndex: -1 } as object)}
        
      />
    </Pressable>
  );
}

export function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return <T v="small" style={{ marginBottom: 6, color: colors.muted }}>{children}{required ? <Text style={{ color: colors.danger }}> *</Text> : null}</T>;
}

export function Field({ error, style, multiline, ...rest }: TextInputProps & { error?: string }) {
  return (
    <View>
      <TextInput
        placeholderTextColor="#A897AD"
        multiline={multiline}
        {...rest}
        style={[
          { minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: error ? colors.danger : colors.line, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, color: colors.text, fontFamily: fonts.medium, fontSize: INPUT_FONT_SIZE },
          multiline ? { minHeight: 88, textAlignVertical: 'top' } : null,
          css({ outlineColor: colors.accent }),
          style,
        ]}
      />
      {error ? <T v="small" style={{ color: colors.danger, marginTop: 4 }} accessibilityLiveRegion="polite">{error}</T> : null}
    </View>
  );
}

export function Segmented<K extends string>({ items, value, onChange, label, fill, variant }: {
  items: { key: K; label: string; count?: number; icon?: IconName }[]; value: K; onChange: (k: K) => void; label: string;
  /** Stretch to full width with equal tabs (label + count stacked) instead of a scrollable pill row. */
  fill?: boolean;
  /** 'chips': a swipeable row of separate pills, each sized to its own label (active = filled accent). */
  variant?: 'chips';
}) {
  if (variant === 'chips') {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, maxWidth: '100%' }}
        contentContainerStyle={{ gap: 8, paddingVertical: 2, paddingRight: 4 }}>
        <View accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: 'row', gap: 8 }}>
          {items.map((it) => {
            const on = it.key === value;
            const fg = on ? '#fff' : colors.text;
            return (
              <Pressable
                key={it.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={it.count !== undefined ? `${it.label}, ${it.count}` : it.label}
                onPress={() => onChange(it.key)}
                style={[
                  { minHeight: 44, paddingHorizontal: 16, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0, borderWidth: 1 },
                  on ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: '#fff', borderColor: colors.line },
                  on ? css(shadow.button) : null, css({ cursor: 'pointer' }),
                ]}
              >
                {it.icon ? <Icon name={it.icon} size={16} color={fg} /> : null}
                <Text numberOfLines={1} style={[typo.small, { color: fg, fontFamily: fonts.bold }]}>
                  {it.label}{it.count ? ` (${it.count})` : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }
  const tabs = items.map((it) => {
    const on = it.key === value;
    return (
      <Pressable
        key={it.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        accessibilityLabel={it.count !== undefined ? `${it.label}, ${it.count}` : it.label}
        onPress={() => onChange(it.key)}
        style={[
          { minHeight: 36, paddingHorizontal: fill ? 0 : 14, paddingVertical: fill ? 5 : 0, borderRadius: fill ? 16 : radius.pill, justifyContent: 'center', alignItems: 'center', backgroundColor: on ? '#fff' : 'transparent' },
          fill ? { flex: 1, minWidth: 0 } : { flexShrink: 0 },
          on ? css(shadow.card) : null, css({ cursor: 'pointer' }),
        ]}
      >
        <Text numberOfLines={1} style={[typo.small, { color: on ? colors.accent : colors.muted }, fill ? { fontSize: 11.5, letterSpacing: -0.2 } : null]}>
          {it.label}{!fill && it.count ? ` ${it.count}` : ''}
        </Text>
        {fill && it.count !== undefined ? (
          <Text style={[typo.chip, { fontSize: 11, color: on ? colors.accent : colors.muted, opacity: it.count ? 1 : 0.6 }]}>{it.count}</Text>
        ) : null}
      </Pressable>
    );
  });
  if (fill) {
    return (
      <View accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: 'row', backgroundColor: colors.accentSoft, borderRadius: 20, padding: 3, gap: 1, alignSelf: 'stretch' }}>
        {tabs}
      </View>
    );
  }
  return (
    // One row only: the pill background hugs the labels. Scrolls sideways when it doesn't fit (phones).
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, alignSelf: 'flex-start', maxWidth: '100%' }}>
      <View accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: 'row', backgroundColor: colors.accentSoft, borderRadius: radius.pill, padding: 4, gap: 4 }}>
        {tabs}
      </View>
    </ScrollView>
  );
}

export function Row({ children, gap = 8, style, wrap, ...rest }: ViewProps & { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle>; wrap?: boolean }) {
  return <View {...rest} style={[{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>{children}</View>;
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 10 }} />;
}

/** Small colored dot */
export function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size, backgroundColor: color }} />;
}
