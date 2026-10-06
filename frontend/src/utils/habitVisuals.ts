import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

import { colors } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/**
 * The backend does not store icons or colours, so these are presentation-only:
 * the icon is picked from the habit's name and the accent from its id.
 */
const ICON_RULES: Array<[RegExp, IconName]> = [
  [/workout|gym|exercise|lift|fitness|strength|train/i, 'barbell'],
  [/run|jog|walk|step|cardio|cycle|bike/i, 'walk'],
  [/read|book|study|learn|course/i, 'book'],
  [/code|dsa|program|leetcode|develop|algorithm/i, 'code-slash'],
  [/water|drink|hydrat/i, 'water'],
  [/coffee|tea|caffeine/i, 'cafe'],
  [/sleep|bed|nap|night/i, 'moon'],
  [/meditat|mindful|yoga|breath|relax/i, 'leaf'],
  [/music|guitar|piano|sing|instrument/i, 'musical-notes'],
  [/write|journal|diary|blog/i, 'create'],
];

export function habitIcon(name: string): IconName {
  const rule = ICON_RULES.find(([pattern]) => pattern.test(name));
  return rule ? rule[1] : 'flash';
}

export function habitAccent(id: number): string {
  return colors.accents[Math.abs(id) % colors.accents.length];
}
