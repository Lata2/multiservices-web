import {
  AlarmClock, AppWindow, ArrowDown, ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Award, BadgeCheck, Ban, Banknote, Bath, Bell, BellOff, Bike, Briefcase,
  Bug, Building, Bus, Calendar, CalendarCheck, CalendarClock, CalendarX, Camera, Car, ChartColumn, ChartPie, Check, CheckCheck, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Circle, CircleAlert, CircleCheck, CircleDot, CircleQuestionMark, CircleX, ClipboardList, Clock, CloudOff, CloudSun, CloudUpload, Compass,
  Construction, Copy, CreditCard, Download, Droplet, Eye, EyeOff, FileText, Flame, FlaskConical, Flower2, Funnel, Gauge, Gift, Globe, Hammer, Heart, Hourglass, House,
  IdCard, Images, Inbox, Info, KeyRound, LayoutDashboard, LayoutGrid, Leaf, Link, List, Loader, LoaderCircle, Lock, LockOpen, LogOut, Mail, MailOpen, Map, MapPin, Megaphone,
  Menu, MessageCircle, MessagesSquare, Minus, Moon, Navigation, Package, Palette, PawPrint, Pencil, Percent, Phone, Play, Plus, Power, Radio, Receipt, RefreshCw,
  Repeat, Reply, RotateCcw, Route, Scissors, Search, Send, Settings, Share2, Shield, ShieldCheck, Shirt, ShoppingCart, SlidersHorizontal, Smartphone, Smile,
  Sparkles, Square, SquareCheck, Star, StarHalf, Store, Sun, Tag, Tags, Timer, Trash, TrendingDown, TrendingUp, Truck, Undo2, User, UserPlus, UserRound, Users,
  Wallet, Wrench, X, Zap, Languages, Laptop, Snowflake, Sunrise, Sunset, Gem, type LucideIcon,
} from 'lucide-react';
import { cn } from './cn';

/**
 * Icon registry. Data from the API (e.g. category icons) references these keys, and only
 * the icons listed here are bundled. Add an entry to use a new icon anywhere.
 */
export const icons = {
  'alarm': AlarmClock, 'app': AppWindow, 'arrow-down': ArrowDown, 'arrow-in': ArrowDownLeft, 'arrow-left': ArrowLeft, 'arrow-right': ArrowRight, 'arrow-up': ArrowUp,
  'arrow-out': ArrowUpRight, 'award': Award, 'verified': BadgeCheck, 'ban': Ban, 'cash': Banknote, 'bath': Bath, 'bell': Bell, 'bell-off': BellOff, 'bike': Bike,
  'briefcase': Briefcase, 'bug': Bug, 'building': Building, 'van': Bus, 'calendar': Calendar, 'calendar-check': CalendarCheck, 'calendar-clock': CalendarClock,
  'calendar-x': CalendarX, 'camera': Camera, 'car': Car, 'chart': ChartColumn, 'pie': ChartPie, 'check': Check, 'check-double': CheckCheck,
  'chevron-down': ChevronDown, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight, 'chevron-up': ChevronUp, 'circle': Circle, 'alert': CircleAlert,
  'check-circle': CircleCheck, 'radio-on': CircleDot, 'help': CircleQuestionMark, 'x-circle': CircleX, 'clipboard': ClipboardList, 'clock': Clock,
  'offline': CloudOff, 'partly-sunny': CloudSun, 'upload': CloudUpload, 'compass': Compass, 'construct': Construction, 'copy': Copy, 'card': CreditCard,
  'download': Download, 'droplet': Droplet, 'eye': Eye, 'eye-off': EyeOff, 'document': FileText, 'flame': Flame, 'flask': FlaskConical, 'flower': Flower2,
  'funnel': Funnel, 'gauge': Gauge, 'gift': Gift, 'globe': Globe, 'hammer': Hammer, 'heart': Heart, 'hourglass': Hourglass, 'home': House, 'id-card': IdCard,
  'images': Images, 'inbox': Inbox, 'info': Info, 'key': KeyRound, 'dashboard': LayoutDashboard, 'grid': LayoutGrid, 'leaf': Leaf, 'link': Link, 'list': List,
  'loader': Loader, 'spinner': LoaderCircle, 'lock': Lock, 'unlock': LockOpen, 'logout': LogOut, 'mail': Mail, 'mail-open': MailOpen, 'map': Map, 'pin': MapPin,
  'megaphone': Megaphone, 'menu': Menu, 'chat': MessageCircle, 'chats': MessagesSquare, 'minus': Minus, 'moon': Moon, 'navigate': Navigation, 'package': Package,
  'palette': Palette, 'paw': PawPrint, 'pencil': Pencil, 'percent': Percent, 'phone': Phone, 'play': Play, 'plus': Plus, 'power': Power, 'radio': Radio,
  'receipt': Receipt, 'refresh': RefreshCw, 'repeat': Repeat, 'reply': Reply, 'undo': RotateCcw, 'route': Route, 'scissors': Scissors, 'search': Search,
  'send': Send, 'settings': Settings, 'share': Share2, 'shield': Shield, 'shield-check': ShieldCheck, 'shirt': Shirt, 'cart': ShoppingCart,
  'sliders': SlidersHorizontal, 'smartphone': Smartphone, 'smile': Smile, 'sparkles': Sparkles, 'square': Square, 'square-check': SquareCheck, 'star': Star,
  'star-half': StarHalf, 'store': Store, 'sun': Sun, 'tag': Tag, 'tags': Tags, 'timer': Timer, 'trash': Trash, 'trending-down': TrendingDown,
  'trending-up': TrendingUp, 'truck': Truck, 'back': Undo2, 'user': User, 'user-plus': UserPlus, 'user-round': UserRound, 'users': Users, 'wallet': Wallet,
  'wrench': Wrench, 'x': X, 'zap': Zap, 'language': Languages, 'laptop': Laptop, 'snowflake': Snowflake, 'sunrise': Sunrise, 'sunset': Sunset, 'gem': Gem,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export interface IconProps {
  /** Registry key. Unknown names (e.g. from API data) render a neutral circle. */
  name: IconName | (string & {});
  size?: number;
  className?: string;
  strokeWidth?: number;
  filled?: boolean;
  label?: string;
}

export function Icon({ name, size = 18, className, strokeWidth = 2, filled, label }: IconProps) {
  const Cmp = (icons as Record<string, LucideIcon>)[name] ?? Circle;
  return (
    <Cmp
      size={size}
      strokeWidth={strokeWidth}
      className={cn('shrink-0', filled && 'fill-current', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
