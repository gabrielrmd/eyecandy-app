"use client";

import { useState, useCallback } from "react";

// --- Validation rule types ---

interface RequiredRule {
  type: "required";
  message?: string;
}

interface MinLengthRule {
  type: "minLength";
  value: number;
  message?: string;
}

interface MaxLengthRule {
  type: "maxLength";
  value: number;
  message?: string;
}

interface CustomRule {
  type: "custom";
  validate: (value: string) => boolean;
  message: string;
}

export type ValidationRule =
  | RequiredRule
  | MinLengthRule
  | MaxLengthRule
  | CustomRule;

export type ValidationSchema = Record<string, ValidationRule[]>;

// --- Hook ---

export function useFormValidation(schema: ValidationSchema) {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const runRules = useCallback(
    (fieldName: string, value: string): string | undefined => {
      const rules = schema[fieldName];
      if (!rules) return undefined;

      for (const rule of rules) {
        switch (rule.type) {
          case "required":
            if (!value || value.trim().length === 0) {
              return rule.message ?? `${fieldName} is required`;
            }
            break;
          case "minLength":
            if (value.trim().length < rule.value) {
              return (
                rule.message ??
                `${fieldName} must be at least ${rule.value} characters`
              );
            }
            break;
          case "maxLength":
            if (value.trim().length > rule.value) {
              return (
                rule.message ??
                `${fieldName} must be at most ${rule.value} characters`
              );
            }
            break;
          case "custom":
            if (!rule.validate(value)) {
              return rule.message;
            }
            break;
        }
      }

      return undefined;
    },
    [schema],
  );

  const validateField = useCallback(
    (fieldName: string, value: string): string | undefined => {
      const error = runRules(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
      return error;
    },
    [runRules],
  );

  const validateAll = useCallback(
    (values: Record<string, string>): boolean => {
      const nextErrors: Record<string, string | undefined> = {};
      let valid = true;

      for (const fieldName of Object.keys(schema)) {
        const error = runRules(fieldName, values[fieldName] ?? "");
        nextErrors[fieldName] = error;
        if (error) valid = false;
      }

      setErrors(nextErrors);
      return valid;
    },
    [schema, runRules],
  );

  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const hasErrors = Object.values(errors).some(Boolean);

  return { errors, validateField, validateAll, clearError, hasErrors };
}
