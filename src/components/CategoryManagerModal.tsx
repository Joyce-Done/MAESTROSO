import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  Music,
  BookOpen,
  Church,
  Users,
  Heart,
  Star,
  Disc,
  Mic,
  Award,
  Zap,
  Flame,
  Layers,
  Radio,
  FileText,
  Smile,
  Compass,
  Coffee,
  Bookmark,
  Headphones,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { RepertoireCategory, PianoSong } from '../types';
import { soundService } from '../services/audio';

// Available Lucide Icons for Repertoire Categories
export const CATEGORY_ICON_MAP: Record<string, any> = {
  Music,
  BookOpen,
  Church,
  Users,
  Sparkles,
  Heart,
  Star,
  Disc,
  Mic,
  Award,
  Zap,
  Flame,
  Layers,
  Radio,
  FileText,
  Smile,
  Compass,
  Coffee,
  Bookmark,
  Headphones,
};

export const COLOR_PALETTE = [
  { hex: '#B63E88', name: 'Majestic Magenta' },
  { hex: '#DE72B5', name: 'Rose Plum' },
  { hex: '#7B4D8A', name: 'Concert Plum' },
  { hex: '#C7A252', name: 'Imperial Gold' },
  { hex: '#9B51E0', name: 'Royal Violet' },
  { hex: '#06B6D4', name: 'Cyan Sonata' },
  { hex: '#10B981', name: 'Emerald Symphony' },
  { hex: '#F59E0B', name: 'Amber Glow' },
  { hex: '#EC4899', name: 'Pink Vivace' },
  { hex: '#6366F1', name: 'Indigo Harmony' },
  { hex: '#8B5CF6', name: 'Purple Allegro' },
  { hex: '#F43F5E', name: 'Rose Red' },
];

export const CATEGORY_PRESETS = [
  { name: 'Postludes', iconName: 'Sparkles', color: '#EC4899', desc: 'Uplifting dismissal & recessional postludes' },
  { name: 'Offertory & Special', iconName: 'Heart', color: '#F59E0B', desc: 'Meditative offertory solos and special music' },
  { name: 'Duets & Ensembles', iconName: 'Users', color: '#06B6D4', desc: '4-hand piano duets and instrumental accompaniment' },
  { name: 'Technique & Etudes', iconName: 'Zap', color: '#10B981', desc: 'Hanon drills, scales, arpeggios, and Czerny etudes' },
  { name: 'Recital Solos', iconName: 'Award', color: '#8B5CF6', desc: 'Concert and festival performance repertoire' },
  { name: 'Vocal Accompaniment', iconName: 'Mic', color: '#6366F1', desc: 'Solo vocalist and choir accompaniment pieces' },
];

export function renderCategoryIcon(iconName?: string, className = 'w-4 h-4') {
  const IconComponent = (iconName && CATEGORY_ICON_MAP[iconName]) || Music;
  return <IconComponent className={className} />;
}

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: RepertoireCategory[];
  songs: PianoSong[];
  onAddCategory: (category: RepertoireCategory) => void;
  onUpdateCategory: (category: RepertoireCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onReorderCategories: (categories: RepertoireCategory[]) => void;
  onResetCategories: () => void;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  songs,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onResetCategories,
}: CategoryManagerModalProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formIconName, setFormIconName] = useState('Music');
  const [formColor, setFormColor] = useState('#B63E88');
  const [formDescription, setFormDescription] = useState('');

  if (!isOpen) return null;

  const handleStartCreate = (preset?: typeof CATEGORY_PRESETS[0]) => {
    soundService.playSlideClick();
    setEditingCategoryId(null);
    setIsCreatingNew(true);
    if (preset) {
      setFormName(preset.name);
      setFormIconName(preset.iconName);
      setFormColor(preset.color);
      setFormDescription(preset.desc);
    } else {
      setFormName('');
      setFormIconName('Sparkles');
      setFormColor('#DE72B5');
      setFormDescription('');
    }
  };

  const handleStartEdit = (category: RepertoireCategory) => {
    soundService.playSlideClick();
    setIsCreatingNew(false);
    setEditingCategoryId(category.id);
    setFormName(category.name);
    setFormIconName(category.iconName || 'Music');
    setFormColor(category.color || '#B63E88');
    setFormDescription(category.description || '');
  };

  const handleCancelForm = () => {
    setEditingCategoryId(null);
    setIsCreatingNew(false);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (isCreatingNew) {
      const newId = `cat_${Date.now()}_${formName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const newCat: RepertoireCategory = {
        id: newId,
        name: formName.trim(),
        iconName: formIconName,
        color: formColor,
        description: formDescription.trim() || undefined,
        isDefault: false,
      };
      onAddCategory(newCat);
    } else if (editingCategoryId) {
      const existing = categories.find((c) => c.id === editingCategoryId);
      if (existing) {
        onUpdateCategory({
          ...existing,
          name: formName.trim(),
          iconName: formIconName,
          color: formColor,
          description: formDescription.trim() || undefined,
        });
      }
    }

    soundService.playHabitComplete();
    setEditingCategoryId(null);
    setIsCreatingNew(false);
  };

  const handleDelete = (category: RepertoireCategory) => {
    const songCount = songs.filter((s) => s.category === category.id).length;
    let message = `Are you sure you want to delete the category "${category.name}"?`;
    if (songCount > 0) {
      message = `"${category.name}" contains ${songCount} piece(s). Deleting will remove this category tab. Confirm delete?`;
    }
    if (confirm(message)) {
      soundService.playSlideClick();
      onDeleteCategory(category.id);
      if (editingCategoryId === category.id) {
        setEditingCategoryId(null);
      }
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    soundService.playSlideClick();
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= categories.length) return;
    const nextList = [...categories];
    const temp = nextList[index];
    nextList[index] = nextList[newIdx];
    nextList[newIdx] = temp;
    onReorderCategories(nextList);
  };

  return (
    <AnimatePresence>
      <motion.div
        id="category-manager-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0513]/85 backdrop-blur-md p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl majestic-card rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 relative my-auto space-y-5 border border-[#DE72B5]/30 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DE72B5]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B63E88] to-[#4A1037] border border-[#DE72B5]/40 flex items-center justify-center text-white shadow-md">
                <Layers className="w-5 h-5 text-[#FFBBE2]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white font-serif uppercase tracking-wider">
                  Repertoire Categories
                </h2>
                <p className="text-xs text-[#DDD8E2]">
                  Add more categories, customize icons, colors, and reorganize tabs
                </p>
              </div>
            </div>

            <button
              id="close-category-manager-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#2D1A36] hover:bg-[#40234D] text-[#B8A9C2] hover:text-white flex items-center justify-center transition-colors border border-[#4D2B5B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Preset Add Buttons */}
          {!isCreatingNew && !editingCategoryId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#DE72B5]" />
                  Quick 1-Click Category Presets
                </span>
                <span className="text-[11px] text-[#B8A9C2]">Tap to instantly create</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_PRESETS.map((preset) => {
                  const alreadyExists = categories.some(
                    (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                  );
                  return (
                    <button
                      key={preset.name}
                      id={`preset-cat-${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      disabled={alreadyExists}
                      onClick={() => handleStartCreate(preset)}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        alreadyExists
                          ? 'opacity-40 bg-[#1D0F22]/50 border-[#4D2B5B] cursor-not-allowed'
                          : 'bg-[#2D1A36]/80 hover:bg-[#40234D] border-[#DE72B5]/25 hover:border-[#DE72B5] shadow-sm hover:scale-[1.02]'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: preset.color }}
                      >
                        {renderCategoryIcon(preset.iconName, 'w-3.5 h-3.5')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white block truncate">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-[#B8A9C2] block truncate">
                          {alreadyExists ? 'Already added' : '+ Add Category'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form for Creating / Editing Category */}
          {(isCreatingNew || editingCategoryId) && (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSaveCategory}
              className="p-4 sm:p-5 rounded-2xl bg-[#1D0F22] border border-[#DE72B5]/40 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#DE72B5]/20">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#DE72B5]" />
                  {isCreatingNew ? 'Create New Category' : 'Edit Category Details'}
                </h3>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs text-[#B8A9C2] hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {/* Name & Description */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">
                    Category Name *
                  </label>
                  <input
                    id="category-form-name-input"
                    type="text"
                    required
                    placeholder="e.g. Postludes, Recital Pieces, Duets, Contemporary"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#2D1A36] border border-[#B63E88]/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#8F7F94] focus:outline-none focus:border-[#DE72B5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">
                    Description (Optional)
                  </label>
                  <input
                    id="category-form-desc-input"
                    type="text"
                    placeholder="e.g. Service dismissal postludes and celebratory pieces"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-[#2D1A36] border border-[#B63E88]/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#8F7F94] focus:outline-none focus:border-[#DE72B5]"
                  />
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="text-xs font-bold text-[#DDD8E2] block mb-2">
                  Select Tab Icon
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-36 overflow-y-auto p-1.5 bg-[#2D1A36]/60 rounded-xl border border-[#4D2B5B]">
                  {Object.keys(CATEGORY_ICON_MAP).map((iconKey) => {
                    const isSelected = formIconName === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        id={`icon-choice-${iconKey}`}
                        onClick={() => {
                          soundService.playSlideClick();
                          setFormIconName(iconKey);
                        }}
                        title={iconKey}
                        className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#B63E88] text-white shadow-md scale-110 ring-2 ring-[#FFBBE2]'
                            : 'bg-[#1D0F22] text-[#DDD8E2] hover:text-white hover:bg-[#40234D]'
                        }`}
                      >
                        {renderCategoryIcon(iconKey, 'w-4 h-4')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="text-xs font-bold text-[#DDD8E2] block mb-2">
                  Category Color Swatch
                </label>
                <div className="flex items-center gap-2 flex-wrap p-2 bg-[#2D1A36]/60 rounded-xl border border-[#4D2B5B]">
                  {COLOR_PALETTE.map((pal) => {
                    const isSelected = formColor === pal.hex;
                    return (
                      <button
                        key={pal.hex}
                        type="button"
                        id={`color-choice-${pal.hex.replace('#', '')}`}
                        onClick={() => {
                          soundService.playSlideClick();
                          setFormColor(pal.hex);
                        }}
                        title={pal.name}
                        className={`w-7 h-7 rounded-xl transition-all relative flex items-center justify-center shadow-sm ${
                          isSelected ? 'scale-115 ring-2 ring-white ring-offset-2 ring-offset-[#1D0F22]' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: pal.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 rounded-xl bg-[#2D1A36] text-xs font-medium text-[#B8A9C2] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  id="save-category-submit-btn"
                  type="submit"
                  className="majestic-btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg"
                >
                  {isCreatingNew ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </motion.form>
          )}

          {/* Existing Categories List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Current Categories ({categories.length})
              </span>

              {!isCreatingNew && !editingCategoryId && (
                <button
                  id="custom-create-category-btn"
                  onClick={() => handleStartCreate()}
                  className="majestic-btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Custom Category
                </button>
              )}
            </div>

            <div className="space-y-2">
              {categories.map((cat, idx) => {
                const count = songs.filter(
                  (s) => s.category === cat.id || (cat.id === 'prelude' && (s.category as string) === 'repertoire')
                ).length;

                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-2xl bg-[#1D0F22]/90 border border-[#4D2B5B] hover:border-[#DE72B5]/40 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Color & Icon Badge */}
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md border border-white/20"
                        style={{ backgroundColor: cat.color || '#B63E88' }}
                      >
                        {renderCategoryIcon(cat.iconName, 'w-4 h-4')}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate font-serif">
                            {cat.name}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#40234D] text-[#FFBBE2] font-mono font-bold">
                            {count} {count === 1 ? 'piece' : 'pieces'}
                          </span>
                          {cat.isDefault && (
                            <span className="text-[10px] text-[#B8A9C2] bg-[#2D1A36] px-1.5 py-0.5 rounded border border-[#4D2B5B]">
                              Default
                            </span>
                          )}
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-[#DDD8E2] truncate max-w-md">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Controls: Move Up/Down, Edit, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Reorder up */}
                      <button
                        id={`move-up-${cat.id}`}
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        title="Move Tab Left/Up"
                        className="p-1.5 rounded-xl bg-[#2D1A36] hover:bg-[#40234D] text-[#DDD8E2] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-[#4D2B5B]"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Reorder down */}
                      <button
                        id={`move-down-${cat.id}`}
                        disabled={idx === categories.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        title="Move Tab Right/Down"
                        className="p-1.5 rounded-xl bg-[#2D1A36] hover:bg-[#40234D] text-[#DDD8E2] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-[#4D2B5B]"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        id={`edit-category-${cat.id}`}
                        onClick={() => handleStartEdit(cat)}
                        title="Edit category details"
                        className="p-1.5 rounded-xl bg-[#40234D] hover:bg-[#552F66] text-[#FFBBE2] hover:text-white border border-[#DE72B5]/30 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete (allowed for custom or any category if user desires) */}
                      <button
                        id={`delete-category-${cat.id}`}
                        onClick={() => handleDelete(cat)}
                        title="Delete category"
                        className="p-1.5 rounded-xl bg-[#2D1A36] hover:bg-rose-950/60 text-[#B8A9C2] hover:text-rose-300 border border-[#4D2B5B] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Reset & Close */}
          <div className="pt-3 border-t border-[#DE72B5]/20 flex items-center justify-between text-xs">
            <button
              id="reset-categories-btn"
              onClick={() => {
                if (confirm('Reset all categories back to default (Preludes, Hymns, Lord\'s Supper, Choir)?')) {
                  soundService.playSlideClick();
                  onResetCategories();
                }
              }}
              className="text-[#B8A9C2] hover:text-white flex items-center gap-1.5 underline underline-offset-2"
            >
              <RotateCcw className="w-3 h-3 text-[#DE72B5]" />
              Reset to Defaults
            </button>

            <button
              id="close-category-manager-done-btn"
              onClick={onClose}
              className="majestic-btn-secondary px-4 py-2 rounded-xl font-bold"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
