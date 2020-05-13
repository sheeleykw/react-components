import { isBefore, isAfter, isSameDay, isSameMonth, isWithinInterval } from 'date-fns';
import React, { useState, useRef } from 'react';

import { classnames } from '../../helpers/component';
import { DateTuple } from '.';

const getEventValue = ({ target }: { target: { dataset?: { i: number } } } & React.FormEvent) => (
    days: Array<Date>
) => {
    const idx = target?.dataset?.i;
    if (idx === undefined) {
        return undefined;
    }
    return days[idx];
};

export interface Props {
    days: Array<Date>;
    markers: Record<string, unknown>;
    onSelectDate: (a1: Date) => void;
    onSelectDateRange: (a1: DateTuple) => void;
    now: Date;
    selectedDate?: Date;
    activeDate: Date;
    dateRange?: DateTuple;
    min?: Date;
    max?: Date;
    formatDay: (a1: Date) => string;
    numberOfDays: number;
    numberOfWeeks: number;
}

const MonthDays = ({
    days,
    onSelectDate,
    markers = {},
    onSelectDateRange,
    dateRange,
    formatDay,
    now,
    min,
    max,
    selectedDate,
    activeDate,
    numberOfDays,
    numberOfWeeks
}: Props) => {
    const [temporaryDateRange, setTemporaryDateRange] = useState<DateTuple | undefined>(undefined);
    const rangeStartRef = useRef<Date | undefined>(undefined);
    const rangeEndRef = useRef<Date | undefined>(undefined);

    const style = {
        '--minicalendar-days-numberOfDays': numberOfDays,
        '--minicalendar-days-numberOfWeeks': numberOfWeeks
    };

    const handleMouseDown = (event: Parameters<typeof getEventValue>[0]) => {
        const targetDate = getEventValue(event)(days);
        if (rangeStartRef.current || !targetDate || !onSelectDateRange) {
            return;
        }

        setTemporaryDateRange([targetDate, undefined]);
        rangeStartRef.current = targetDate;

        const handleMouseUp = () => {
            if (rangeEndRef.current && rangeStartRef.current) {
                onSelectDateRange(
                    isAfter(rangeEndRef.current, rangeStartRef.current)
                        ? [rangeStartRef.current, rangeEndRef.current]
                        : [rangeEndRef.current, rangeStartRef.current]
                );
            }

            setTemporaryDateRange(undefined);
            rangeStartRef.current = undefined;
            rangeEndRef.current = undefined;

            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseOver = (event: Parameters<typeof getEventValue>[0]) => {
        const overDate = getEventValue(event)(days);
        if (!rangeStartRef.current || !overDate || !onSelectDateRange) {
            return;
        }
        rangeEndRef.current = overDate;

        setTemporaryDateRange(
            isAfter(overDate, rangeStartRef.current)
                ? [rangeStartRef.current, overDate]
                : [overDate, rangeStartRef.current]
        );
    };

    const handleClick = (event: Parameters<typeof getEventValue>[0]) => {
        const value = getEventValue(event)(days);
        if (value) {
            onSelectDate(value);
        }
    };

    const [rangeStart, rangeEnd] = temporaryDateRange || dateRange || [];

    return (
        <ul
            className="unstyled m0 aligncenter minicalendar-days"
            style={style}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseOver={handleMouseOver}
        >
            {days.map((dayDate, i) => {
                const isBeforeMin = min ? isBefore(dayDate, min) : false;
                const isAfterMax = max ? isAfter(dayDate, max) : false;
                const isOutsideMinMax = isBeforeMin || isAfterMax;
                const isActiveMonth = isOutsideMinMax ? false : isSameMonth(dayDate, activeDate);
                const isCurrent = isSameDay(now, dayDate);
                const isInterval =
                    (rangeStart && rangeEnd && isWithinInterval(dayDate, { start: rangeStart, end: rangeEnd })) ||
                    (rangeStart && isSameDay(rangeStart, dayDate));
                const isIntervalBound =
                    rangeStart && rangeEnd ? isSameDay(rangeStart, dayDate) || isSameDay(rangeEnd, dayDate) : false;
                const isPressed = selectedDate ? isSameDay(selectedDate, dayDate) || isInterval : false;

                // only for CSS layout: beginning/end of week OR beginning/end of interval in week
                const isIntervalBoundBegin =
                    (isInterval && i % numberOfDays === 0) ||
                    (isInterval && rangeStart && isSameDay(rangeStart, dayDate));
                const isIntervalBoundEnd =
                    (isInterval && i % numberOfDays === numberOfDays - 1) ||
                    (isInterval && rangeEnd && isSameDay(rangeEnd, dayDate)) ||
                    (!rangeEnd && isIntervalBoundBegin);

                const hasMarker = markers[dayDate.getTime()];

                const className = classnames([
                    'minicalendar-day no-pointer-events-children',
                    !isActiveMonth && 'minicalendar-day--inactive-month',
                    isIntervalBound && 'minicalendar-day--range-bound',
                    isIntervalBoundBegin && 'minicalendar-day--range-bound-begin',
                    isIntervalBoundEnd && 'minicalendar-day--range-bound-end',
                    isInterval && 'minicalendar-day--range'
                ]);

                return (
                    <li key={dayDate.toString()}>
                        <button
                            disabled={isOutsideMinMax}
                            aria-label={formatDay(dayDate)}
                            aria-current={isCurrent ? 'date' : undefined}
                            aria-pressed={isPressed ? true : undefined}
                            className={className}
                            data-i={i}
                            data-current-day={dayDate.getDate()}
                            type="button"
                        >
                            <span className="minicalendar-day-inner">{dayDate.getDate()}</span>
                            {hasMarker ? <span className="minicalendar-day--marker" /> : null}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
};

export default React.memo(MonthDays);