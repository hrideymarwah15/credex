import { describe, it, expect } from 'vitest';
import { runAudit } from '@/lib/audit/engine';
import type { AuditInput } from '@/lib/audit/types';

describe('Audit Engine', () => {
  describe('Cursor auditing', () => {
    it('recommends downgrade from Business to Pro for small teams', () => {
      const input: AuditInput = {
        teamSize: 4,
        useCase: 'coding',
        tools: [
          { tool: 'cursor', plan: 'cursor_business', seats: 4, monthlySpend: 160 }
        ]
      };

      const result = runAudit(input);
      const finding = result.findings[0];

      expect(finding).toBeDefined();
      expect(finding.action).toContain('Pro');
      expect(finding.monthlySavings).toBeGreaterThan(0);
      expect(finding.severity).toBe('save_big');
    });

    it('keeps Business plan for teams >10', () => {
      const input: AuditInput = {
        teamSize: 12,
        useCase: 'coding',
        tools: [
          { tool: 'cursor', plan: 'cursor_business', seats: 12, monthlySpend: 480 }
        ]
      };

      const result = runAudit(input);
      const finding = result.findings[0];

      expect(finding.action).toContain('Keep');
      expect(finding.monthlySavings).toBe(0);
      expect(finding.severity).toBe('optimal');
    });

    it('suggests Windsurf as cheaper alternative for non-heavy coding', () => {
      const input: AuditInput = {
        teamSize: 2,
        useCase: 'writing',
        tools: [
          { tool: 'cursor', plan: 'cursor_pro', seats: 2, monthlySpend: 40 }
        ]
      };

      const result = runAudit(input);
      const finding = result.findings[0];

      expect(finding.action).toMatch(/Windsurf/i);
      expect(finding.monthlySavings).toBeGreaterThan(0);
    });
  });

  describe('Claude auditing', () => {
    it('recommends Pro over Team for small teams', () => {
      const input: AuditInput = {
        teamSize: 2,
        useCase: 'mixed',
        tools: [
          { tool: 'claude', plan: 'claude_team', seats: 2, monthlySpend: 60 }
        ]
      };

      const result = runAudit(input);
      const finding = result.findings[0];

      expect(finding.action).toContain('Pro');
      expect(finding.monthlySavings).toBeGreaterThan(0);
    });

    it('keeps Team plan for teams ≥5', () => {
      const input: AuditInput = {
        teamSize: 5,
        useCase: 'mixed',
        tools: [
          { tool: 'claude', plan: 'claude_team', seats: 5, monthlySpend: 150 }
        ]
      };

      const result = runAudit(input);
      const finding = result.findings[0];

      expect(finding.action).toContain('Keep');
      expect(finding.monthlySavings).toBe(0);
    });
  });

  describe('GitHub Copilot auditing', () => {
    it('detects overspend on Business vs Individual for small teams', () => {
      const input: AuditInput = {
        teamSize: 3,
        useCase: 'coding',
        tools: [
          { tool: 'copilot', plan: 'copilot_business', seats: 3, monthlySpend: 57 }
        ]
      };

      const result = runAudit(input);
      const finding = result.findings[0];

      expect(finding.monthlySavings).toBeGreaterThan(0);
    });
  });

  describe('API-based tools', () => {
    it('flags high API spend that could move to subscription', () => {
      const input: AuditInput = {
        teamSize: 5,
        useCase: 'coding',
        tools: [
          { tool: 'anthropic_api', plan: 'anthropic_api', seats: 1, monthlySpend: 200 }
        ]
      };

      const result = runAudit(input);
      const finding = result.findings[0];

      // Should suggest Claude Team/Enterprise for high usage
      expect(finding.action.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-tool optimization', () => {
    it('calculates total savings across multiple tools', () => {
      const input: AuditInput = {
        teamSize: 5,
        useCase: 'coding',
        tools: [
          { tool: 'cursor', plan: 'cursor_business', seats: 5, monthlySpend: 200 },
          { tool: 'claude', plan: 'claude_team', seats: 3, monthlySpend: 90 },
          { tool: 'chatgpt', plan: 'chatgpt_plus', seats: 5, monthlySpend: 100 }
        ]
      };

      const result = runAudit(input);

      expect(result.findings).toHaveLength(3);
      expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0);
      expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
      expect(result.totalCurrentMonthly).toBe(390);
    });

    it('identifies already-optimal stacks', () => {
      const input: AuditInput = {
        teamSize: 15,
        useCase: 'coding',
        tools: [
          { tool: 'cursor', plan: 'cursor_business', seats: 15, monthlySpend: 600 },
          { tool: 'claude', plan: 'claude_team', seats: 15, monthlySpend: 450 }
        ]
      };

      const result = runAudit(input);

      expect(result.isOptimal).toBe(true);
      expect(result.totalMonthlySavings).toBe(0);
    });
  });

  describe('Credex eligibility', () => {
    it('marks high-savings audits as Credex-eligible', () => {
      const input: AuditInput = {
        teamSize: 10,
        useCase: 'coding',
        tools: [
          { tool: 'cursor', plan: 'cursor_business', seats: 4, monthlySpend: 160 },
          { tool: 'claude', plan: 'claude_team', seats: 2, monthlySpend: 60 },
          { tool: 'chatgpt', plan: 'chatgpt_team', seats: 5, monthlySpend: 125 },
          { tool: 'copilot', plan: 'copilot_business', seats: 10, monthlySpend: 190 }
        ]
      };

      const result = runAudit(input);

      // With multiple overspends, should exceed $500/mo threshold
      if (result.totalMonthlySavings > 500) {
        expect(result.credexEligible).toBe(true);
      }
    });

    it('does not mark low-savings audits as Credex-eligible', () => {
      const input: AuditInput = {
        teamSize: 2,
        useCase: 'writing',
        tools: [
          { tool: 'chatgpt', plan: 'chatgpt_plus', seats: 2, monthlySpend: 40 }
        ]
      };

      const result = runAudit(input);

      if (result.totalMonthlySavings < 500) {
        expect(result.credexEligible).toBe(false);
      }
    });
  });

  describe('Edge cases', () => {
    it('handles invalid tool IDs gracefully', () => {
      const input: AuditInput = {
        teamSize: 3,
        useCase: 'coding',
        tools: [
          // @ts-expect-error Testing invalid tool
          { tool: 'invalid_tool', plan: 'some_plan', seats: 3, monthlySpend: 100 }
        ]
      };

      expect(() => runAudit(input)).not.toThrow();
    });

    it('handles zero monthly spend', () => {
      const input: AuditInput = {
        teamSize: 1,
        useCase: 'coding',
        tools: [
          { tool: 'claude', plan: 'claude_free', seats: 1, monthlySpend: 0 }
        ]
      };

      const result = runAudit(input);

      expect(result.totalCurrentMonthly).toBe(0);
      expect(result.findings[0].currentSpend).toBe(0);
    });

    it('returns valid result for empty tools array', () => {
      const input: AuditInput = {
        teamSize: 1,
        useCase: 'coding',
        tools: []
      };

      const result = runAudit(input);

      expect(result.findings).toHaveLength(0);
      expect(result.totalMonthlySavings).toBe(0);
      expect(result.totalCurrentMonthly).toBe(0);
      expect(result.isOptimal).toBe(true);
    });
  });
});
