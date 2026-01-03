import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Paperclip, ArrowRight, Eye } from 'lucide-react';
import { Note } from '@/lib/types';

interface LinkedNotesViewProps {
  notes: Note[];
  onClose: () => void;
  onNavigateToNote: (noteId: string) => void;
  onPreviewNote?: (noteId: string) => void;
}

export function LinkedNotesView({ notes, onClose, onNavigateToNote, onPreviewNote }: Readonly<LinkedNotesViewProps>) {
  return (
    <div className="h-full flex flex-col border-l border-border bg-card/30">
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <h2 className="text-lg font-semibold">Linked Notes ({notes.length})</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
          aria-label="Close linked notes"
          title="Close linked notes"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No linked notes
            </div>
          ) : (
            notes.map(note => (
              <Card 
                key={note.id} 
                className="p-4 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-base flex-1">{note.title || 'Untitled'}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {note.attachments && note.attachments.length > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        <Paperclip className="w-3 h-3 mr-0.5" />
                        {note.attachments.length}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-foreground line-clamp-3 mb-3">
                  {note.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                </div>
                <div className="flex items-center gap-2">
                  {onPreviewNote && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPreviewNote(note.id)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onNavigateToNote(note.id)}
                    className="flex-1"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Open
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
