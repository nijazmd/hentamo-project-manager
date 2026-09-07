import React, { useState, useEffect } from 'react';
import { Comment } from '../../types';
import { Button } from '../common/Button';
import { Textarea } from '../common/Input';
import { MessageSquare, Send } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateUtils';
import { commentService } from '../../services/dbStore';
import { useAuth } from '../../context/AuthContext';

interface CommentSectionProps {
  workItemId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ workItemId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newContent, setNewContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    commentService.getComments(workItemId).then(data => {
      if (isMounted) setComments(data);
    });
    return () => { isMounted = false; };
  }, [workItemId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !user) return;

    setIsLoading(true);
    try {
      const added = await commentService.addComment(workItemId, newContent.trim(), user);
      setComments(prev => [...prev, added]);
      setNewContent('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare size={16} className="text-sky-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Comments ({comments.length})
        </h4>
      </div>

      {/* List of comments */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-1">
            No comments yet. Leave a note or development log.
          </p>
        ) : (
          comments.map(c => (
            <div
              key={c.id}
              className="p-2.5 rounded-lg bg-[#0B0F17] border border-slate-800/80 text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-200">
                  {c.userName || 'Developer'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {formatRelativeTime(c.createdAt)}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add comment box */}
      <form onSubmit={handleAddComment} className="space-y-2 pt-1">
        <Textarea
          placeholder="Add a log entry or comment..."
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          rows={2}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="xs"
            variant="primary"
            isLoading={isLoading}
            disabled={!newContent.trim()}
            rightIcon={<Send size={12} />}
          >
            Post Comment
          </Button>
        </div>
      </form>
    </div>
  );
};
