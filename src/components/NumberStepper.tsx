import React, { useState } from 'react';
import { InputNumber } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';

interface NumberStepperProps {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
  style?: React.CSSProperties;
}

const NumberStepper: React.FC<NumberStepperProps> = ({
  value: controlledValue,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  className = '',
  size = 'large',
  disabled,
  style,
}) => {
  const [internalVal, setInternalVal] = useState<number | null>(
    controlledValue !== undefined ? controlledValue : (defaultValue ?? null)
  );

  const current = controlledValue !== undefined ? controlledValue : internalVal;

  const handleChange = (val: number | null) => {
    setInternalVal(val);
    onChange?.(val);
  };

  const decrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    const cur = current ?? 0;
    const next = cur - step;
    handleChange(min !== undefined ? Math.max(min, next) : next);
  };

  const increment = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    const cur = current ?? 0;
    const next = cur + step;
    handleChange(max !== undefined ? Math.min(max, next) : next);
  };

  const atMin = min !== undefined && (current ?? 0) <= min;
  const atMax = max !== undefined && (current ?? 0) >= max;

  return (
    <InputNumber
      value={controlledValue !== undefined ? controlledValue : internalVal}
      onChange={handleChange}
      min={min}
      max={max}
      placeholder={placeholder}
      className={`number-stepper ${className}`.trim()}
      size={size}
      controls={false}
      disabled={disabled}
      style={{ width: '100%', ...style }}
      addonBefore={
        <span
          className={`stepper-btn${atMin || disabled ? ' stepper-btn-disabled' : ''}`}
          onMouseDown={decrement}
        >
          <MinusOutlined />
        </span>
      }
      addonAfter={
        <span
          className={`stepper-btn${atMax || disabled ? ' stepper-btn-disabled' : ''}`}
          onMouseDown={increment}
        >
          <PlusOutlined />
        </span>
      }
    />
  );
};

export default NumberStepper;
