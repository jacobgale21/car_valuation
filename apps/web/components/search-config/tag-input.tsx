'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TagInputProps {
  id: string;
  label: string;
  description?: string;
  placeholder: string;
  tags: string[];
  suggestions?: readonly string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}

/** Tag-style multi-value input with removable chips and optional quick-select suggestions. */
export function TagInput({
  id,
  label,
  description,
  placeholder,
  tags,
  suggestions = [],
  onAdd,
  onRemove,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const commitTag = () => {
    onAdd(inputValue);
    setInputValue('');
  };

  const availableSuggestions = suggestions.filter(
    (item) => !tags.some((tag) => tag.toLowerCase() === item.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={id}>{label}</Label>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1 pl-2.5">
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="hover:bg-muted rounded-sm p-0.5"
                aria-label={`Remove ${tag}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Input
        id={id}
        value={inputValue}
        placeholder={placeholder}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commitTag();
          }
        }}
        onBlur={commitTag}
      />

      {availableSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Quick select
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((item) => (
              <Button
                key={item}
                type="button"
                variant="outline"
                size="sm"
                className={cn('h-7 text-xs')}
                onClick={() => onAdd(item)}
              >
                + {item}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
