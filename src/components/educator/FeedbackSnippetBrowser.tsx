/**
 * Feedback Snippet Browser
 *
 * Compact sidebar component for browsing and inserting snippets during grading.
 * Provides search, category filtering, and tabs for All/Most Used/Recent.
 */

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { MagnifyingGlass, Sparkle, Fire, Clock, Tag, Lightning } from '@phosphor-icons/react'
import { useFeedbackSnippets } from '@/hooks/use-feedback-snippets'
import type { FeedbackSnippet, FeedbackCategory } from '@/lib/types'
import { FEEDBACK_CATEGORIES } from '@/lib/types'

interface FeedbackSnippetBrowserProps {
  onInsert: (content: string) => void
}

export function FeedbackSnippetBrowser({ onInsert }: FeedbackSnippetBrowserProps) {
  const {
    snippets,
    incrementUsage,
    searchSnippets,
    getMostUsed,
    getRecent
  } = useFeedbackSnippets()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | 'all'>('all')
  const [activeTab, setActiveTab] = useState('all')

  const filteredSnippets = useMemo(() => {
    let result = snippets

    if (searchQuery) {
      result = searchSnippets(searchQuery)
    }

    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category === selectedCategory)
    }

    return result
  }, [snippets, searchQuery, selectedCategory, searchSnippets])

  const handleInsert = (snippet: FeedbackSnippet) => {
    incrementUsage(snippet.id)
    onInsert(snippet.content)
  }

  const getCategoryColor = (category: FeedbackCategory): string => {
    const colors: Record<FeedbackCategory, string> = {
      grammar: 'bg-red-500/20 text-red-600',
      thesis: 'bg-purple-500/20 text-purple-600',
      evidence: 'bg-blue-500/20 text-blue-600',
      organization: 'bg-orange-500/20 text-orange-600',
      clarity: 'bg-cyan-500/20 text-cyan-600',
      citations: 'bg-amber-500/20 text-amber-600',
      analysis: 'bg-indigo-500/20 text-indigo-600',
      mechanics: 'bg-pink-500/20 text-pink-600',
      positive: 'bg-green-500/20 text-green-600',
      other: 'bg-gray-500/20 text-gray-600'
    }
    return colors[category] || colors.other
  }

  const SnippetItem = ({ snippet }: { snippet: FeedbackSnippet }) => {
    const categoryLabel = FEEDBACK_CATEGORIES.find(
      c => c.value === snippet.category
    )?.label || snippet.category

    return (
      <div
        className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge
            variant="outline"
            className={`text-xs ${getCategoryColor(snippet.category)}`}
          >
            {categoryLabel}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleInsert(snippet)}
            className="h-6 px-2 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Lightning size={12} weight="fill" />
            Insert
          </Button>
        </div>
        <p className="text-sm line-clamp-3 cursor-pointer" onClick={() => handleInsert(snippet)}>
          {snippet.content}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>Used {snippet.usageCount}×</span>
        </div>
      </div>
    )
  }

  const renderSnippetList = (items: FeedbackSnippet[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No snippets found
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {items.map(snippet => (
          <SnippetItem key={snippet.id} snippet={snippet} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as FeedbackCategory | 'all')}
        >
          <SelectTrigger className="h-9">
            <Tag size={14} className="mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {FEEDBACK_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1 gap-1 text-xs">
            <Sparkle size={12} weight="fill" />
            All
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex-1 gap-1 text-xs">
            <Fire size={12} weight="fill" />
            Top
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex-1 gap-1 text-xs">
            <Clock size={12} weight="fill" />
            Recent
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 mt-4">
          <TabsContent value="all" className="mt-0">
            {renderSnippetList(filteredSnippets)}
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            {renderSnippetList(getMostUsed(15))}
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            {renderSnippetList(getRecent(15))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
