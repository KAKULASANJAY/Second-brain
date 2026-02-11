'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { Button, Input, Textarea, Select, TagInput, Modal } from '@/components/ui';
import type { KnowledgeType } from '@/lib/database.types';
import toast from 'react-hot-toast';

// =============================================================================
// KNOWLEDGE CAPTURE FORM
// =============================================================================

interface KnowledgeFormData {
  title: string;
  content: string;
  type: KnowledgeType;
  source_url: string;
  user_tags: string[];
}

interface KnowledgeFormProps {
  onSuccess?: () => void;
  initialData?: Partial<KnowledgeFormData>;
  mode?: 'create' | 'edit';
  itemId?: string;
}

const typeOptions = [
  { value: 'note', label: '📝 Note' },
  { value: 'link', label: '🔗 Link' },
  { value: 'insight', label: '💡 Insight' },
];

export function KnowledgeForm({
  onSuccess,
  initialData,
  mode = 'create',
}: KnowledgeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<KnowledgeFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    type: initialData?.type || 'note',
    source_url: initialData?.source_url || '',
    user_tags: initialData?.user_tags || [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof KnowledgeFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof KnowledgeFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (formData.source_url && !isValidUrl(formData.source_url)) {
      newErrors.source_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source_url: formData.source_url || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      toast.success(
        mode === 'create' 
          ? 'Knowledge captured! AI is processing...' 
          : 'Updated successfully!'
      );

      // Reset form on create
      if (mode === 'create') {
        setFormData({
          title: '',
          content: '',
          type: 'note',
          source_url: '',
          user_tags: [],
        });
      }

      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof KnowledgeFormData>(
    field: K,
    value: KnowledgeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <Input
        label="Title"
        placeholder="What's this about?"
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
        error={errors.title}
        required
      />

      <Select
        label="Type"
        options={typeOptions}
        value={formData.type}
        onChange={(e) => updateField('type', e.target.value as KnowledgeType)}
      />

      <Textarea
        label="Content"
        placeholder="Write your thoughts, paste content, or describe what you learned..."
        value={formData.content}
        onChange={(e) => updateField('content', e.target.value)}
        error={errors.content}
        rows={6}
        required
      />

      <Input
        label="Source URL"
        placeholder="https://example.com (optional)"
        value={formData.source_url}
        onChange={(e) => updateField('source_url', e.target.value)}
        error={errors.source_url}
        hint="Add a source link if applicable"
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-surface-700">
          Tags
        </label>
        <TagInput
          tags={formData.user_tags}
          onChange={(tags) => updateField('user_tags', tags)}
          placeholder="Press Enter to add tags..."
        />
        <p className="text-sm text-surface-500">
          AI will also suggest additional tags automatically
        </p>
      </div>

      {/* FIX START - Improved submit button area with better separation */}
      <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-surface-100">
        <Button
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          leftIcon={!isSubmitting && <Plus className="h-4 w-4" />}
          size="lg"
        >
          {isSubmitting ? 'Processing...' : mode === 'create' ? 'Capture Knowledge' : 'Save Changes'}
        </Button>
      </div>
      {/* FIX END */}

      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-3 p-4 bg-brand-50 rounded-lg text-brand-700"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">
            AI is generating summary and tags... This may take a moment.
          </span>
        </motion.div>
      )}
    </motion.form>
  );
}

// =============================================================================
// KNOWLEDGE CAPTURE MODAL
// =============================================================================

interface KnowledgeCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function KnowledgeCaptureModal({
  isOpen,
  onClose,
  onSuccess,
}: KnowledgeCaptureModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Capture Knowledge" size="lg">
      <KnowledgeForm onSuccess={handleSuccess} />
    </Modal>
  );
}
