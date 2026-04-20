import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PenLine } from 'lucide-react';
import type { ManualClientInfo } from '@/types/h1b';

interface ManualInfoFormProps {
  info: ManualClientInfo;
  onChange: (info: ManualClientInfo) => void;
  mode: 'full' | 'supplement';
}

export function ManualInfoForm({ info, onChange, mode }: ManualInfoFormProps) {
  const update = (field: keyof ManualClientInfo, value: string | number) => {
    onChange({ ...info, [field]: value });
  };

  return (
    <Card className="border border-accent/30 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-accent" />
          <h3 className="font-display text-base font-semibold text-foreground">
            {mode === 'full' ? 'Manual Input' : 'Supplement Missing Info'}
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            {mode === 'full' ? '全手填模式' : '补充信息'}
          </Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Highest Degree <span className="text-muted-foreground">(最高学历)</span>
            </label>
            <Input
              placeholder="e.g. Master of Science"
              value={info.degree}
              onChange={e => update('degree', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Degree Level <span className="text-muted-foreground">(学历级别)</span>
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-1">Critical</Badge>
            </label>
            <Select
              value={info.degreeLevel}
              onValueChange={v => update('degreeLevel', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bachelor">Bachelor's 本科</SelectItem>
                <SelectItem value="master">Master's 硕士 (2x lottery chance)</SelectItem>
                <SelectItem value="doctorate">Doctorate 博士 (2x lottery chance)</SelectItem>
                <SelectItem value="professional">Professional 专业学位 (2x lottery chance)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Master's+ from US institution = enters BOTH regular &amp; advanced degree pools.
              硕士及以上（美国院校）= 同时参加普通池和高学历池抽签。
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Graduate Major <span className="text-muted-foreground">(研究生专业)</span>
            </label>
            <Input
              placeholder="e.g. Computer Science"
              value={info.graduateMajor}
              onChange={e => update('graduateMajor', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Undergrad Major <span className="text-muted-foreground">(本科专业)</span>
            </label>
            <Input
              placeholder="e.g. Architecture"
              value={info.undergradMajor}
              onChange={e => update('undergradMajor', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Work Experience (years) <span className="text-muted-foreground">(工作年限)</span>
            </label>
            <Input
              type="number"
              min={0}
              placeholder="e.g. 3"
              value={info.workYears || ''}
              onChange={e => update('workYears', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Key Skills / Tech Stack <span className="text-muted-foreground">(核心技能)</span>
          </label>
          <Textarea
            placeholder="e.g. Python, Machine Learning, SQL, Tableau (comma separated)"
            value={info.skills}
            onChange={e => update('skills', e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Key Coursework Domains <span className="text-muted-foreground">(主要课程领域)</span>
          </label>
          <Textarea
            placeholder="e.g. Data Science: 40%, Computer Science: 30%, Business: 20%, Statistics: 10%"
            value={info.courseDomains}
            onChange={e => update('courseDomains', e.target.value)}
            rows={2}
          />
          <p className="text-[10px] text-muted-foreground">
            Format: "Domain: percentage" separated by commas. 格式：领域: 百分比，逗号分隔。
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Job Title / Intended Role <span className="text-muted-foreground">(目标岗位)</span>
          </label>
          <Input
            placeholder="e.g. Data Analyst, Software Developer"
            value={info.jobTitle}
            onChange={e => update('jobTitle', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
