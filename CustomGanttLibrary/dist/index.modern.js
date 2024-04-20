import React, { useMemo, useRef, useState, useEffect } from 'react';

var ViewMode;

(function (ViewMode) {
  ViewMode["Hour"] = "Hour";
  ViewMode["QuarterDay"] = "Quarter Day";
  ViewMode["HalfDay"] = "Half Day";
  ViewMode["Day"] = "Day";
  ViewMode["Week"] = "Week";
  ViewMode["Month"] = "Month";
  ViewMode["QuarterYear"] = "QuarterYear";
  ViewMode["Year"] = "Year";
})(ViewMode || (ViewMode = {}));

const intlDTCache = {};
const getCachedDateTimeFormat = function (locString, opts) {
  if (opts === void 0) {
    opts = {};
  }

  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache[key];

  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }

  return dtf;
};
const addToDate = (date, quantity, scale) => {
  const newDate = new Date(date.getFullYear() + (scale === "year" ? quantity : 0), date.getMonth() + (scale === "month" ? quantity : 0), date.getDate() + (scale === "day" ? quantity : 0), date.getHours() + (scale === "hour" ? quantity : 0), date.getMinutes() + (scale === "minute" ? quantity : 0), date.getSeconds() + (scale === "second" ? quantity : 0), date.getMilliseconds() + (scale === "millisecond" ? quantity : 0));
  return newDate;
};
const startOfDate = (date, scale) => {
  const scores = ["millisecond", "second", "minute", "hour", "day", "month", "year"];

  const shouldReset = _scale => {
    const maxScore = scores.indexOf(scale);
    return scores.indexOf(_scale) <= maxScore;
  };

  const newDate = new Date(date.getFullYear(), shouldReset("year") ? 0 : date.getMonth(), shouldReset("month") ? 1 : date.getDate(), shouldReset("day") ? 0 : date.getHours(), shouldReset("hour") ? 0 : date.getMinutes(), shouldReset("minute") ? 0 : date.getSeconds(), shouldReset("second") ? 0 : date.getMilliseconds());
  return newDate;
};
const ganttDateRange = (tasks, viewMode, preStepsCount) => {
  let newStartDate = tasks[0].start;
  let newEndDate = tasks[0].start;

  for (const task of tasks) {
    if (task.start < newStartDate) {
      newStartDate = task.start;
    }

    if (task.end > newEndDate) {
      newEndDate = task.end;
    }
  }

  switch (viewMode) {
    case ViewMode.Year:
      newStartDate = addToDate(newStartDate, -1, "year");
      newStartDate = startOfDate(newStartDate, "year");
      newEndDate = addToDate(newEndDate, 1, "year");
      newEndDate = startOfDate(newEndDate, "year");
      break;

    case ViewMode.QuarterYear:
      newStartDate = addToDate(newStartDate, -3, "month");
      newStartDate = startOfDate(newStartDate, "month");
      newEndDate = addToDate(newEndDate, 3, "year");
      newEndDate = startOfDate(newEndDate, "year");
      break;

    case ViewMode.Month:
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, "month");
      newStartDate = startOfDate(newStartDate, "month");
      newEndDate = addToDate(newEndDate, 1, "year");
      newEndDate = startOfDate(newEndDate, "year");
      break;

    case ViewMode.Week:
      newStartDate = startOfDate(newStartDate, "day");
      newStartDate = addToDate(getMonday(newStartDate), -7 * preStepsCount, "day");
      newEndDate = startOfDate(newEndDate, "day");
      newEndDate = addToDate(newEndDate, 1.5, "month");
      break;

    case ViewMode.Day:
      newStartDate = startOfDate(newStartDate, "day");
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, "day");
      newEndDate = startOfDate(newEndDate, "day");
      newEndDate = addToDate(newEndDate, 19, "day");
      break;

    case ViewMode.QuarterDay:
      newStartDate = startOfDate(newStartDate, "day");
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, "day");
      newEndDate = startOfDate(newEndDate, "day");
      newEndDate = addToDate(newEndDate, 66, "hour");
      break;

    case ViewMode.HalfDay:
      newStartDate = startOfDate(newStartDate, "day");
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, "day");
      newEndDate = startOfDate(newEndDate, "day");
      newEndDate = addToDate(newEndDate, 108, "hour");
      break;

    case ViewMode.Hour:
      newStartDate = startOfDate(newStartDate, "hour");
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, "hour");
      newEndDate = startOfDate(newEndDate, "day");
      newEndDate = addToDate(newEndDate, 1, "day");
      break;
  }

  return [newStartDate, newEndDate];
};
const seedDates = (startDate, endDate, viewMode) => {
  let currentDate = new Date(startDate);
  const dates = [currentDate];

  while (currentDate < endDate) {
    switch (viewMode) {
      case ViewMode.Year:
        currentDate = addToDate(currentDate, 1, "year");
        break;

      case ViewMode.QuarterYear:
        currentDate = addToDate(currentDate, 3, "month");
        break;

      case ViewMode.Month:
        currentDate = addToDate(currentDate, 1, "month");
        break;

      case ViewMode.Week:
        currentDate = addToDate(currentDate, 7, "day");
        break;

      case ViewMode.Day:
        currentDate = addToDate(currentDate, 1, "day");
        break;

      case ViewMode.HalfDay:
        currentDate = addToDate(currentDate, 12, "hour");
        break;

      case ViewMode.QuarterDay:
        currentDate = addToDate(currentDate, 6, "hour");
        break;

      case ViewMode.Hour:
        currentDate = addToDate(currentDate, 1, "hour");
        break;
    }

    dates.push(currentDate);
  }

  return dates;
};
const getLocaleMonth = (date, locale) => {
  let bottomValue = getCachedDateTimeFormat(locale, {
    month: "long"
  }).format(date);
  bottomValue = bottomValue.replace(bottomValue[0], bottomValue[0].toLocaleUpperCase());
  return bottomValue;
};
const getLocalDayOfWeek = (date, locale, format) => {
  let bottomValue = getCachedDateTimeFormat(locale, {
    weekday: format
  }).format(date);
  bottomValue = bottomValue.replace(bottomValue[0], bottomValue[0].toLocaleUpperCase());
  return bottomValue;
};

const getMonday = date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getWeekNumberISO8601 = date => {
  const tmpDate = new Date(date.valueOf());
  const dayNumber = (tmpDate.getDay() + 6) % 7;
  tmpDate.setDate(tmpDate.getDate() - dayNumber + 3);
  const firstThursday = tmpDate.valueOf();
  tmpDate.setMonth(0, 1);

  if (tmpDate.getDay() !== 4) {
    tmpDate.setMonth(0, 1 + (4 - tmpDate.getDay() + 7) % 7);
  }

  const weekNumber = (1 + Math.ceil((firstThursday - tmpDate.valueOf()) / 604800000)).toString();

  if (weekNumber.length === 1) {
    return "0" + weekNumber;
  } else {
    return weekNumber;
  }
};
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

var styles = {"ganttTable":"_3_ygE","ganttTable_Header":"_1nBOt","ganttTable_HeaderSeparator":"_2eZzQ","ganttTable_HeaderItem":"_WuQ0f"};

const TaskListHeaderDefault = _ref => {
  let {
    headerHeight,
    fontFamily,
    fontSize,
    rowWidth
  } = _ref;
  return React.createElement("div", {
    className: styles.ganttTable,
    style: {
      fontFamily: fontFamily,
      fontSize: fontSize
    }
  }, React.createElement("div", {
    className: styles.ganttTable_Header,
    style: {
      height: headerHeight - 2
    }
  }, React.createElement("div", {
    className: styles.ganttTable_HeaderItem,
    style: {
      minWidth: rowWidth
    }
  }, "\u00A0Name"), React.createElement("div", {
    className: styles.ganttTable_HeaderSeparator,
    style: {
      height: headerHeight * 0.5,
      marginTop: headerHeight * 0.2
    }
  }), React.createElement("div", {
    className: styles.ganttTable_HeaderItem,
    style: {
      minWidth: rowWidth
    }
  }, "\u00A0From"), React.createElement("div", {
    className: styles.ganttTable_HeaderSeparator,
    style: {
      height: headerHeight * 0.5,
      marginTop: headerHeight * 0.25
    }
  }), React.createElement("div", {
    className: styles.ganttTable_HeaderItem,
    style: {
      minWidth: rowWidth
    }
  }, "\u00A0To")));
};

var styles$1 = {"taskListWrapper":"_3ZbQT","taskListTableRow":"_34SS0","taskListCell":"_3lLk3","taskListNameWrapper":"_nI1Xw","taskListExpander":"_2QjE6","taskListEmptyExpander":"_2TfEi"};

const localeDateStringCache = {};

const toLocaleDateStringFactory = locale => (date, dateTimeOptions) => {
  const key = date.toString();
  let lds = localeDateStringCache[key];

  if (!lds) {
    lds = date.toLocaleDateString(locale, dateTimeOptions);
    localeDateStringCache[key] = lds;
  }

  return lds;
};

const dateTimeOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric"
};
const TaskListTableDefault = _ref => {
  let {
    rowHeight,
    rowWidth,
    tasks,
    fontFamily,
    fontSize,
    locale,
    onExpanderClick
  } = _ref;
  const toLocaleDateString = useMemo(() => toLocaleDateStringFactory(locale), [locale]);
  return React.createElement("div", {
    className: styles$1.taskListWrapper,
    style: {
      fontFamily: fontFamily,
      fontSize: fontSize,
      backgroundColor: 'white'
    }
  }, tasks.map(t => {
    let expanderSymbol = "";

    if (t.hideChildren === false) {
      expanderSymbol = "▼";
    } else if (t.hideChildren === true) {
      expanderSymbol = "▶";
    }

    return React.createElement("div", {
      className: styles$1.taskListTableRow,
      style: {
        height: rowHeight
      },
      key: t.id + "row"
    }, React.createElement("div", {
      className: styles$1.taskListCell,
      style: {
        minWidth: rowWidth,
        maxWidth: rowWidth
      },
      title: t.name
    }, React.createElement("div", {
      className: styles$1.taskListNameWrapper
    }, React.createElement("div", {
      className: expanderSymbol ? styles$1.taskListExpander : styles$1.taskListEmptyExpander,
      onClick: () => onExpanderClick(t)
    }, expanderSymbol), React.createElement("div", null, t.name))), React.createElement("div", {
      className: styles$1.taskListCell,
      style: {
        minWidth: rowWidth,
        maxWidth: rowWidth
      }
    }, "\u00A0", toLocaleDateString(t.start, dateTimeOptions)), React.createElement("div", {
      className: styles$1.taskListCell,
      style: {
        minWidth: rowWidth,
        maxWidth: rowWidth
      }
    }, "\u00A0", toLocaleDateString(t.end, dateTimeOptions)));
  }));
};

var styles$2 = {"tooltipDefaultContainer":"_3T42e","tooltipDefaultContainerParagraph":"_29NTg","tooltipDetailsContainer":"_25P-K","tooltipDetailsContainerHidden":"_3gVAq"};

const Tooltip = _ref => {
  let {
    task,
    rowHeight,
    rtl,
    svgContainerHeight,
    svgContainerWidth,
    scrollX,
    scrollY,
    arrowIndent,
    fontSize,
    fontFamily,
    headerHeight,
    taskListWidth,
    TooltipContent
  } = _ref;
  const tooltipRef = useRef(null);
  const [relatedY, setRelatedY] = useState(0);
  const [relatedX, setRelatedX] = useState(0);
  useEffect(() => {
    if (tooltipRef.current) {
      const tooltipHeight = tooltipRef.current.offsetHeight * 1.1;
      const tooltipWidth = tooltipRef.current.offsetWidth * 1.1;
      let newRelatedY = task.index * rowHeight - scrollY + headerHeight;
      let newRelatedX;

      if (rtl) {
        newRelatedX = task.x1 - arrowIndent * 1.5 - tooltipWidth - scrollX;

        if (newRelatedX < 0) {
          newRelatedX = task.x2 + arrowIndent * 1.5 - scrollX;
        }

        const tooltipLeftmostPoint = tooltipWidth + newRelatedX;

        if (tooltipLeftmostPoint > svgContainerWidth) {
          newRelatedX = svgContainerWidth - tooltipWidth;
          newRelatedY += rowHeight;
        }
      } else {
        newRelatedX = task.x2 + arrowIndent * 1.5 + taskListWidth - scrollX;
        const tooltipLeftmostPoint = tooltipWidth + newRelatedX;
        const fullChartWidth = taskListWidth + svgContainerWidth;

        if (tooltipLeftmostPoint > fullChartWidth) {
          newRelatedX = task.x1 + taskListWidth - arrowIndent * 1.5 - scrollX - tooltipWidth;
        }

        if (newRelatedX < taskListWidth) {
          newRelatedX = svgContainerWidth + taskListWidth - tooltipWidth;
          newRelatedY += rowHeight;
        }
      }

      const tooltipLowerPoint = tooltipHeight + newRelatedY - scrollY;

      if (tooltipLowerPoint > svgContainerHeight - scrollY) {
        newRelatedY = svgContainerHeight - tooltipHeight;
      }

      setRelatedY(newRelatedY);
      setRelatedX(newRelatedX);
    }
  }, [tooltipRef, task, arrowIndent, scrollX, scrollY, headerHeight, taskListWidth, rowHeight, svgContainerHeight, svgContainerWidth, rtl]);
  return React.createElement("div", {
    ref: tooltipRef,
    className: relatedX ? styles$2.tooltipDetailsContainer : styles$2.tooltipDetailsContainerHidden,
    style: {
      left: relatedX,
      top: relatedY
    }
  }, React.createElement(TooltipContent, {
    task: task,
    fontSize: fontSize,
    fontFamily: fontFamily
  }));
};
const StandardTooltipContent = _ref2 => {
  let {
    task,
    fontSize,
    fontFamily
  } = _ref2;
  const style = {
    fontSize,
    fontFamily
  };
  return React.createElement("div", {
    className: styles$2.tooltipDefaultContainer,
    style: style
  }, React.createElement("b", {
    style: {
      fontSize: fontSize + 6
    }
  }, task.name + ": " + task.start.getDate() + "-" + (task.start.getMonth() + 1) + "-" + task.start.getFullYear() + " - " + task.end.getDate() + "-" + (task.end.getMonth() + 1) + "-" + task.end.getFullYear()), task.end.getTime() - task.start.getTime() !== 0 && React.createElement("p", {
    className: styles$2.tooltipDefaultContainerParagraph
  }, "Duration: " + ~~((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24)) + " day(s)"), React.createElement("p", {
    className: styles$2.tooltipDefaultContainerParagraph
  }, !!task.progress && "Progress: " + task.progress + " %"));
};

var styles$3 = {"scroll":"_1eT-t"};

const VerticalScroll = _ref => {
  let {
    scroll,
    ganttHeight,
    ganttFullHeight,
    headerHeight,
    rtl,
    onScroll
  } = _ref;
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scroll;
    }
  }, [scroll]);
  return React.createElement("div", {
    style: {
      height: ganttHeight,
      marginTop: headerHeight,
      marginLeft: rtl ? "" : "-1rem"
    },
    className: styles$3.scroll,
    onScroll: onScroll,
    ref: scrollRef
  }, React.createElement("div", {
    style: {
      height: ganttFullHeight,
      width: 1
    }
  }));
};

const TaskList = _ref => {
  let {
    headerHeight,
    fontFamily,
    fontSize,
    rowWidth,
    rowHeight,
    scrollY,
    tasks,
    selectedTask,
    setSelectedTask,
    onExpanderClick,
    locale,
    ganttHeight,
    taskListRef,
    horizontalContainerClass,
    TaskListHeader,
    TaskListTable
  } = _ref;
  const horizontalContainerRef = useRef(null);
  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);
  const headerProps = {
    headerHeight,
    fontFamily,
    fontSize,
    rowWidth
  };
  const selectedTaskId = selectedTask ? selectedTask.id : "";
  const tableProps = {
    rowHeight,
    rowWidth,
    fontFamily,
    fontSize,
    tasks,
    locale,
    selectedTaskId: selectedTaskId,
    setSelectedTask,
    onExpanderClick
  };
  return React.createElement("div", {
    ref: taskListRef
  }, React.createElement(TaskListHeader, Object.assign({}, headerProps)), React.createElement("div", {
    ref: horizontalContainerRef,
    className: horizontalContainerClass,
    style: ganttHeight ? {
      height: ganttHeight
    } : {}
  }, React.createElement(TaskListTable, Object.assign({}, tableProps))));
};

var styles$4 = {"gridRow":"_2dZTy","gridRowLine":"_3rUKi","gridTick":"_RuwuK"};

const GridBody = _ref => {
  let {
    tasks,
    dates,
    rowHeight,
    svgWidth,
    columnWidth,
    todayColor,
    rtl
  } = _ref;
  let y = 0;
  const gridRows = [];
  const rowLines = [React.createElement("line", {
    key: "RowLineFirst",
    x: "0",
    y1: 0,
    x2: svgWidth,
    y2: 0,
    className: styles$4.gridRowLine
  })];

  for (const task of tasks) {
    gridRows.push(React.createElement("rect", {
      key: "Row" + task.id,
      x: "0",
      y: y,
      width: svgWidth,
      height: rowHeight,
      className: styles$4.gridRow
    }));
    rowLines.push(React.createElement("line", {
      key: "RowLine" + task.id,
      x: "0",
      y1: y + rowHeight,
      x2: svgWidth,
      y2: y + rowHeight,
      className: styles$4.gridRowLine
    }));
    y += rowHeight;
  }

  const now = new Date();
  let tickX = 0;
  const ticks = [];
  let today = React.createElement("rect", null);

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    ticks.push(React.createElement("line", {
      key: date.getTime(),
      x1: tickX,
      y1: 0,
      x2: tickX,
      y2: y,
      className: styles$4.gridTick
    }));

    if (i + 1 !== dates.length && date.getTime() < now.getTime() && dates[i + 1].getTime() >= now.getTime() || i !== 0 && i + 1 === dates.length && date.getTime() < now.getTime() && addToDate(date, date.getTime() - dates[i - 1].getTime(), "millisecond").getTime() >= now.getTime()) {
      today = React.createElement("rect", {
        x: tickX,
        y: 0,
        width: columnWidth,
        height: y,
        fill: todayColor
      });
    }

    if (rtl && i + 1 !== dates.length && date.getTime() >= now.getTime() && dates[i + 1].getTime() < now.getTime()) {
      today = React.createElement("rect", {
        x: tickX + columnWidth,
        y: 0,
        width: columnWidth,
        height: y,
        fill: todayColor
      });
    }

    tickX += columnWidth;
  }

  return React.createElement("g", {
    className: "gridBody"
  }, React.createElement("g", {
    className: "rows"
  }, gridRows), React.createElement("g", {
    className: "rowLines"
  }, rowLines), React.createElement("g", {
    className: "ticks"
  }, ticks), React.createElement("g", {
    className: "today"
  }, today));
};

const Grid = props => {
  return React.createElement("g", {
    className: "grid"
  }, React.createElement(GridBody, Object.assign({}, props)));
};

var styles$5 = {"calendarBottomText":"_9w8d5","calendarTopTick":"_1rLuZ","calendarTopText":"_2q1Kt","calendarHeader":"_35nLX"};

const TopPartOfCalendar = _ref => {
  let {
    value,
    x1Line,
    y1Line,
    y2Line,
    xText,
    yText
  } = _ref;
  return React.createElement("g", {
    className: "calendarTop"
  }, React.createElement("line", {
    x1: x1Line,
    y1: y1Line,
    x2: x1Line,
    y2: y2Line,
    className: styles$5.calendarTopTick,
    key: value + "line"
  }), React.createElement("text", {
    key: value + "text",
    y: yText,
    x: xText,
    className: styles$5.calendarTopText
  }, value));
};

const Calendar = _ref => {
  let {
    dateSetup,
    locale,
    viewMode,
    rtl,
    headerHeight,
    columnWidth,
    fontFamily,
    fontSize
  } = _ref;

  const getCalendarValuesForYear = () => {
    const topValues = [];
    const bottomValues = [];
    const topDefaultHeight = headerHeight * 0.5;

    for (let i = 0; i < dateSetup.dates.length; i++) {
      const date = dateSetup.dates[i];
      const bottomValue = date.getFullYear();
      bottomValues.push(React.createElement("text", {
        key: date.getTime(),
        y: headerHeight * 0.8,
        x: columnWidth * i + columnWidth * 0.5,
        className: styles$5.calendarBottomText
      }, bottomValue));

      if (i === 0 || date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()) {
        const topValue = date.getFullYear().toString();
        let xText;

        if (rtl) {
          xText = (6 + i + date.getFullYear() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getFullYear()) * columnWidth;
        }

        topValues.push(React.createElement(TopPartOfCalendar, {
          key: topValue,
          value: topValue,
          x1Line: columnWidth * i,
          y1Line: 0,
          y2Line: headerHeight,
          xText: xText,
          yText: topDefaultHeight * 0.9
        }));
      }
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForQuarterYear = () => {
    const topValues = [];
    const bottomValues = [];
    const topDefaultHeight = headerHeight * 0.5;

    for (let i = 0; i < dateSetup.dates.length; i++) {
      const date = dateSetup.dates[i];
      const quarter = "Q" + Math.floor((date.getMonth() + 3) / 3);
      bottomValues.push(React.createElement("text", {
        key: date.getTime(),
        y: headerHeight * 0.8,
        x: columnWidth * i + columnWidth * 0.5,
        className: styles$5.calendarBottomText
      }, quarter));

      if (i === 0 || date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()) {
        const topValue = date.getFullYear().toString();
        let xText;

        if (rtl) {
          xText = (6 + i + date.getMonth() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getMonth()) * columnWidth;
        }

        topValues.push(React.createElement(TopPartOfCalendar, {
          key: topValue,
          value: topValue,
          x1Line: columnWidth * i,
          y1Line: 0,
          y2Line: topDefaultHeight,
          xText: Math.abs(xText),
          yText: topDefaultHeight * 0.9
        }));
      }
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForMonth = () => {
    const topValues = [];
    const bottomValues = [];
    const topDefaultHeight = headerHeight * 0.5;

    for (let i = 0; i < dateSetup.dates.length; i++) {
      const date = dateSetup.dates[i];
      const bottomValue = getLocaleMonth(date, locale);
      bottomValues.push(React.createElement("text", {
        key: bottomValue + date.getFullYear(),
        y: headerHeight * 0.8,
        x: columnWidth * i + columnWidth * 0.5,
        className: styles$5.calendarBottomText
      }, bottomValue));

      if (i === 0 || date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()) {
        const topValue = date.getFullYear().toString();
        let xText;

        if (rtl) {
          xText = (6 + i + date.getMonth() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getMonth()) * columnWidth;
        }

        topValues.push(React.createElement(TopPartOfCalendar, {
          key: topValue,
          value: topValue,
          x1Line: columnWidth * i,
          y1Line: 0,
          y2Line: topDefaultHeight,
          xText: xText,
          yText: topDefaultHeight * 0.9
        }));
      }
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForWeek = () => {
    const topValues = [];
    const bottomValues = [];
    let weeksCount = 1;
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;

    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i];
      let topValue = "";

      if (i === 0 || date.getMonth() !== dates[i - 1].getMonth()) {
        topValue = `${getLocaleMonth(date, locale)}, ${date.getFullYear()}`;
      }

      const bottomValue = `W${getWeekNumberISO8601(date)}`;
      bottomValues.push(React.createElement("text", {
        key: date.getTime(),
        y: headerHeight * 0.8,
        x: columnWidth * (i + +rtl),
        className: styles$5.calendarBottomText
      }, bottomValue));

      if (topValue) {
        if (i !== dates.length - 1) {
          topValues.push(React.createElement(TopPartOfCalendar, {
            key: topValue,
            value: topValue,
            x1Line: columnWidth * i + weeksCount * columnWidth,
            y1Line: 0,
            y2Line: topDefaultHeight,
            xText: columnWidth * i + columnWidth * weeksCount * 0.5,
            yText: topDefaultHeight * 0.9
          }));
        }

        weeksCount = 0;
      }

      weeksCount++;
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForDay = () => {
    const topValues = [];
    const bottomValues = [];
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = `${getLocalDayOfWeek(date, locale, "short")}, ${date.getDate().toString()}`;
      bottomValues.push(React.createElement("text", {
        key: date.getTime(),
        y: headerHeight * 0.8,
        x: columnWidth * i + columnWidth * 0.5,
        className: styles$5.calendarBottomText
      }, bottomValue));

      if (i + 1 !== dates.length && date.getMonth() !== dates[i + 1].getMonth()) {
        const topValue = getLocaleMonth(date, locale);
        topValues.push(React.createElement(TopPartOfCalendar, {
          key: topValue + date.getFullYear(),
          value: topValue,
          x1Line: columnWidth * (i + 1),
          y1Line: 0,
          y2Line: topDefaultHeight,
          xText: columnWidth * (i + 1) - getDaysInMonth(date.getMonth(), date.getFullYear()) * columnWidth * 0.5,
          yText: topDefaultHeight * 0.9
        }));
      }
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForPartOfDay = () => {
    const topValues = [];
    const bottomValues = [];
    const ticks = viewMode === ViewMode.HalfDay ? 2 : 4;
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = getCachedDateTimeFormat(locale, {
        hour: "numeric"
      }).format(date);
      bottomValues.push(React.createElement("text", {
        key: date.getTime(),
        y: headerHeight * 0.8,
        x: columnWidth * (i + +rtl),
        className: styles$5.calendarBottomText,
        fontFamily: fontFamily
      }, bottomValue));

      if (i === 0 || date.getDate() !== dates[i - 1].getDate()) {
        const topValue = `${getLocalDayOfWeek(date, locale, "short")}, ${date.getDate()} ${getLocaleMonth(date, locale)}`;
        topValues.push(React.createElement(TopPartOfCalendar, {
          key: topValue + date.getFullYear(),
          value: topValue,
          x1Line: columnWidth * i + ticks * columnWidth,
          y1Line: 0,
          y2Line: topDefaultHeight,
          xText: columnWidth * i + ticks * columnWidth * 0.5,
          yText: topDefaultHeight * 0.9
        }));
      }
    }

    return [topValues, bottomValues];
  };

  const getCalendarValuesForHour = () => {
    const topValues = [];
    const bottomValues = [];
    const topDefaultHeight = headerHeight * 0.5;
    const dates = dateSetup.dates;

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const bottomValue = getCachedDateTimeFormat(locale, {
        hour: "numeric"
      }).format(date);
      bottomValues.push(React.createElement("text", {
        key: date.getTime(),
        y: headerHeight * 0.8,
        x: columnWidth * (i + +rtl),
        className: styles$5.calendarBottomText,
        fontFamily: fontFamily
      }, bottomValue));

      if (i !== 0 && date.getDate() !== dates[i - 1].getDate()) {
        const displayDate = dates[i - 1];
        const topValue = `${getLocalDayOfWeek(displayDate, locale, "long")}, ${displayDate.getDate()} ${getLocaleMonth(displayDate, locale)}`;
        const topPosition = (date.getHours() - 24) / 2;
        topValues.push(React.createElement(TopPartOfCalendar, {
          key: topValue + displayDate.getFullYear(),
          value: topValue,
          x1Line: columnWidth * i,
          y1Line: 0,
          y2Line: topDefaultHeight,
          xText: columnWidth * (i + topPosition),
          yText: topDefaultHeight * 0.9
        }));
      }
    }

    return [topValues, bottomValues];
  };

  let topValues = [];
  let bottomValues = [];

  switch (dateSetup.viewMode) {
    case ViewMode.Year:
      [topValues, bottomValues] = getCalendarValuesForYear();
      break;

    case ViewMode.QuarterYear:
      [topValues, bottomValues] = getCalendarValuesForQuarterYear();
      break;

    case ViewMode.Month:
      [topValues, bottomValues] = getCalendarValuesForMonth();
      break;

    case ViewMode.Week:
      [topValues, bottomValues] = getCalendarValuesForWeek();
      break;

    case ViewMode.Day:
      [topValues, bottomValues] = getCalendarValuesForDay();
      break;

    case ViewMode.QuarterDay:
    case ViewMode.HalfDay:
      [topValues, bottomValues] = getCalendarValuesForPartOfDay();
      break;

    case ViewMode.Hour:
      [topValues, bottomValues] = getCalendarValuesForHour();
  }

  return React.createElement("g", {
    className: "calendar",
    fontSize: fontSize,
    fontFamily: fontFamily
  }, React.createElement("rect", {
    x: 0,
    y: 0,
    width: columnWidth * dateSetup.dates.length,
    height: headerHeight,
    className: styles$5.calendarHeader
  }), bottomValues, " ", topValues);
};

// A type of promise-like that resolves synchronously and supports only one observer

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously call a function and send errors to recovery continuation
function _catch(body, recover) {
	try {
		var result = body();
	} catch(e) {
		return recover(e);
	}
	if (result && result.then) {
		return result.then(void 0, recover);
	}
	return result;
}

const Arrow = _ref => {
  let {
    taskFrom,
    taskTo,
    rowHeight,
    taskHeight,
    arrowIndent,
    rtl
  } = _ref;
  let path;
  let trianglePoints;

  if (rtl) {
    [path, trianglePoints] = drownPathAndTriangleRTL(taskFrom, taskTo, rowHeight, taskHeight, arrowIndent);
  } else {
    [path, trianglePoints] = drownPathAndTriangle(taskFrom, taskTo, rowHeight, taskHeight, arrowIndent);
  }

  return React.createElement("g", {
    className: "arrow"
  }, React.createElement("path", {
    strokeWidth: "1.5",
    d: path,
    fill: "none"
  }), React.createElement("polygon", {
    points: trianglePoints
  }));
};

const drownPathAndTriangle = (taskFrom, taskTo, rowHeight, taskHeight, arrowIndent) => {
  const indexCompare = taskFrom.index > taskTo.index ? -1 : 1;
  const taskToEndPosition = taskTo.y + taskHeight / 2;
  const taskFromEndPosition = taskFrom.x2 + arrowIndent * 2;
  const taskFromHorizontalOffsetValue = taskFromEndPosition < taskTo.x1 ? "" : `H ${taskTo.x1 - arrowIndent}`;
  const taskToHorizontalOffsetValue = taskFromEndPosition > taskTo.x1 ? arrowIndent : taskTo.x1 - taskFrom.x2 - arrowIndent;
  const path = `M ${taskFrom.x2} ${taskFrom.y + taskHeight / 2} 
  h ${arrowIndent} 
  v ${indexCompare * rowHeight / 2} 
  ${taskFromHorizontalOffsetValue}
  V ${taskToEndPosition} 
  h ${taskToHorizontalOffsetValue}`;
  const trianglePoints = `${taskTo.x1},${taskToEndPosition} 
  ${taskTo.x1 - 5},${taskToEndPosition - 5} 
  ${taskTo.x1 - 5},${taskToEndPosition + 5}`;
  return [path, trianglePoints];
};

const drownPathAndTriangleRTL = (taskFrom, taskTo, rowHeight, taskHeight, arrowIndent) => {
  const indexCompare = taskFrom.index > taskTo.index ? -1 : 1;
  const taskToEndPosition = taskTo.y + taskHeight / 2;
  const taskFromEndPosition = taskFrom.x1 - arrowIndent * 2;
  const taskFromHorizontalOffsetValue = taskFromEndPosition > taskTo.x2 ? "" : `H ${taskTo.x2 + arrowIndent}`;
  const taskToHorizontalOffsetValue = taskFromEndPosition < taskTo.x2 ? -arrowIndent : taskTo.x2 - taskFrom.x1 + arrowIndent;
  const path = `M ${taskFrom.x1} ${taskFrom.y + taskHeight / 2} 
  h ${-arrowIndent} 
  v ${indexCompare * rowHeight / 2} 
  ${taskFromHorizontalOffsetValue}
  V ${taskToEndPosition} 
  h ${taskToHorizontalOffsetValue}`;
  const trianglePoints = `${taskTo.x2},${taskToEndPosition} 
  ${taskTo.x2 + 5},${taskToEndPosition + 5} 
  ${taskTo.x2 + 5},${taskToEndPosition - 5}`;
  return [path, trianglePoints];
};

const convertToBarTasks = (tasks, dates, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor, projectProgressColor, projectProgressSelectedColor, projectBackgroundColor, projectBackgroundSelectedColor, milestoneBackgroundColor, milestoneBackgroundSelectedColor) => {
  let barTasks = tasks.map((t, i) => {
    return convertToBarTask(t, i, dates, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor, projectProgressColor, projectProgressSelectedColor, projectBackgroundColor, projectBackgroundSelectedColor, milestoneBackgroundColor, milestoneBackgroundSelectedColor);
  });
  barTasks = barTasks.map(task => {
    const dependencies = task.dependencies || [];

    for (let j = 0; j < dependencies.length; j++) {
      const dependence = barTasks.findIndex(value => value.id === dependencies[j]);
      if (dependence !== -1) barTasks[dependence].barChildren.push(task);
    }

    return task;
  });
  return barTasks;
};

const convertToBarTask = (task, index, dates, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor, projectProgressColor, projectProgressSelectedColor, projectBackgroundColor, projectBackgroundSelectedColor, milestoneBackgroundColor, milestoneBackgroundSelectedColor) => {
  let barTask;

  switch (task.type) {
    case "milestone":
      barTask = convertToMilestone(task, index, dates, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, milestoneBackgroundColor, milestoneBackgroundSelectedColor);
      break;

    case "project":
      barTask = convertToBar(task, index, dates, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, projectProgressColor, projectProgressSelectedColor, projectBackgroundColor, projectBackgroundSelectedColor);
      break;

    default:
      barTask = convertToBar(task, index, dates, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor);
      break;
  }

  return barTask;
};

const convertToBar = (task, index, dates, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor) => {
  let x1;
  let x2;

  if (rtl) {
    x2 = taskXCoordinateRTL(task.start, dates, columnWidth);
    x1 = taskXCoordinateRTL(task.end, dates, columnWidth);
  } else {
    x1 = taskXCoordinate(task.start, dates, columnWidth);
    x2 = taskXCoordinate(task.end, dates, columnWidth);
  }

  let typeInternal = task.type;

  if (typeInternal === "task" && x2 - x1 < handleWidth * 2) {
    typeInternal = "smalltask";
    x2 = x1 + handleWidth * 2;
  }

  const [progressWidth, progressX] = progressWithByParams(x1, x2, task.progress, rtl);
  const y = taskYCoordinate(index, rowHeight, taskHeight);
  const hideChildren = task.type === "project" ? task.hideChildren : undefined;
  const styles = {
    backgroundColor: barBackgroundColor,
    backgroundSelectedColor: barBackgroundSelectedColor,
    progressColor: barProgressColor,
    progressSelectedColor: barProgressSelectedColor,
    ...task.styles
  };
  return { ...task,
    typeInternal,
    x1,
    x2,
    y,
    index,
    progressX,
    progressWidth,
    barCornerRadius,
    handleWidth,
    hideChildren,
    height: taskHeight,
    barChildren: [],
    styles
  };
};

const convertToMilestone = (task, index, dates, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, milestoneBackgroundColor, milestoneBackgroundSelectedColor) => {
  const x = taskXCoordinate(task.start, dates, columnWidth);
  const y = taskYCoordinate(index, rowHeight, taskHeight);
  const x1 = x - taskHeight * 0.5;
  const x2 = x + taskHeight * 0.5;
  const rotatedHeight = taskHeight / 1.414;
  const styles = {
    backgroundColor: milestoneBackgroundColor,
    backgroundSelectedColor: milestoneBackgroundSelectedColor,
    progressColor: "",
    progressSelectedColor: "",
    ...task.styles
  };
  return { ...task,
    end: task.start,
    x1,
    x2,
    y,
    index,
    progressX: 0,
    progressWidth: 0,
    barCornerRadius,
    handleWidth,
    typeInternal: task.type,
    progress: 0,
    height: rotatedHeight,
    hideChildren: undefined,
    barChildren: [],
    styles
  };
};

const taskXCoordinate = (xDate, dates, columnWidth) => {
  const index = dates.findIndex(d => d.getTime() >= xDate.getTime()) - 1;
  const remainderMillis = xDate.getTime() - dates[index].getTime();
  const percentOfInterval = remainderMillis / (dates[index + 1].getTime() - dates[index].getTime());
  const x = index * columnWidth + percentOfInterval * columnWidth;
  return x;
};

const taskXCoordinateRTL = (xDate, dates, columnWidth) => {
  let x = taskXCoordinate(xDate, dates, columnWidth);
  x += columnWidth;
  return x;
};

const taskYCoordinate = (index, rowHeight, taskHeight) => {
  const y = index * rowHeight + (rowHeight - taskHeight) / 2;
  return y;
};

const progressWithByParams = (taskX1, taskX2, progress, rtl) => {
  const progressWidth = (taskX2 - taskX1) * progress * 0.01;
  let progressX;

  if (rtl) {
    progressX = taskX2 - progressWidth;
  } else {
    progressX = taskX1;
  }

  return [progressWidth, progressX];
};

const progressByX = (x, task) => {
  if (x >= task.x2) return 100;else if (x <= task.x1) return 0;else {
    const barWidth = task.x2 - task.x1;
    const progressPercent = Math.round((x - task.x1) * 100 / barWidth);
    return progressPercent;
  }
};

const progressByXRTL = (x, task) => {
  if (x >= task.x2) return 0;else if (x <= task.x1) return 100;else {
    const barWidth = task.x2 - task.x1;
    const progressPercent = Math.round((task.x2 - x) * 100 / barWidth);
    return progressPercent;
  }
};

const getProgressPoint = (progressX, taskY, taskHeight) => {
  const point = [progressX - 5, taskY + taskHeight, progressX + 5, taskY + taskHeight, progressX, taskY + taskHeight - 8.66];
  return point.join(",");
};

const startByX = (x, xStep, task) => {
  if (x >= task.x2 - task.handleWidth * 2) {
    x = task.x2 - task.handleWidth * 2;
  }

  const steps = Math.round((x - task.x1) / xStep);
  const additionalXValue = steps * xStep;
  const newX = task.x1 + additionalXValue;
  return newX;
};

const endByX = (x, xStep, task) => {
  if (x <= task.x1 + task.handleWidth * 2) {
    x = task.x1 + task.handleWidth * 2;
  }

  const steps = Math.round((x - task.x2) / xStep);
  const additionalXValue = steps * xStep;
  const newX = task.x2 + additionalXValue;
  return newX;
};

const moveByX = (x, xStep, task) => {
  const steps = Math.round((x - task.x1) / xStep);
  const additionalXValue = steps * xStep;
  const newX1 = task.x1 + additionalXValue;
  const newX2 = newX1 + task.x2 - task.x1;
  return [newX1, newX2];
};

const dateByX = (x, taskX, taskDate, xStep, timeStep) => {
  let newDate = new Date((x - taskX) / xStep * timeStep + taskDate.getTime());
  newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset() - taskDate.getTimezoneOffset()) * 60000);
  return newDate;
};

const handleTaskBySVGMouseEvent = (svgX, action, selectedTask, xStep, timeStep, initEventX1Delta, rtl) => {
  let result;

  switch (selectedTask.type) {
    case "milestone":
      result = handleTaskBySVGMouseEventForMilestone(svgX, action, selectedTask, xStep, timeStep, initEventX1Delta);
      break;

    default:
      result = handleTaskBySVGMouseEventForBar(svgX, action, selectedTask, xStep, timeStep, initEventX1Delta, rtl);
      break;
  }

  return result;
};

const handleTaskBySVGMouseEventForBar = (svgX, action, selectedTask, xStep, timeStep, initEventX1Delta, rtl) => {
  const changedTask = { ...selectedTask
  };
  let isChanged = false;

  switch (action) {
    case "progress":
      if (rtl) {
        changedTask.progress = progressByXRTL(svgX, selectedTask);
      } else {
        changedTask.progress = progressByX(svgX, selectedTask);
      }

      isChanged = changedTask.progress !== selectedTask.progress;

      if (isChanged) {
        const [progressWidth, progressX] = progressWithByParams(changedTask.x1, changedTask.x2, changedTask.progress, rtl);
        changedTask.progressWidth = progressWidth;
        changedTask.progressX = progressX;
      }

      break;

    case "start":
      {
        const newX1 = startByX(svgX, xStep, selectedTask);
        changedTask.x1 = newX1;
        isChanged = changedTask.x1 !== selectedTask.x1;

        if (isChanged) {
          if (rtl) {
            changedTask.end = dateByX(newX1, selectedTask.x1, selectedTask.end, xStep, timeStep);
          } else {
            changedTask.start = dateByX(newX1, selectedTask.x1, selectedTask.start, xStep, timeStep);
          }

          const [progressWidth, progressX] = progressWithByParams(changedTask.x1, changedTask.x2, changedTask.progress, rtl);
          changedTask.progressWidth = progressWidth;
          changedTask.progressX = progressX;
        }

        break;
      }

    case "end":
      {
        const newX2 = endByX(svgX, xStep, selectedTask);
        changedTask.x2 = newX2;
        isChanged = changedTask.x2 !== selectedTask.x2;

        if (isChanged) {
          if (rtl) {
            changedTask.start = dateByX(newX2, selectedTask.x2, selectedTask.start, xStep, timeStep);
          } else {
            changedTask.end = dateByX(newX2, selectedTask.x2, selectedTask.end, xStep, timeStep);
          }

          const [progressWidth, progressX] = progressWithByParams(changedTask.x1, changedTask.x2, changedTask.progress, rtl);
          changedTask.progressWidth = progressWidth;
          changedTask.progressX = progressX;
        }

        break;
      }

    case "move":
      {
        const [newMoveX1, newMoveX2] = moveByX(svgX - initEventX1Delta, xStep, selectedTask);
        isChanged = newMoveX1 !== selectedTask.x1;

        if (isChanged) {
          changedTask.start = dateByX(newMoveX1, selectedTask.x1, selectedTask.start, xStep, timeStep);
          changedTask.end = dateByX(newMoveX2, selectedTask.x2, selectedTask.end, xStep, timeStep);
          changedTask.x1 = newMoveX1;
          changedTask.x2 = newMoveX2;
          const [progressWidth, progressX] = progressWithByParams(changedTask.x1, changedTask.x2, changedTask.progress, rtl);
          changedTask.progressWidth = progressWidth;
          changedTask.progressX = progressX;
        }

        break;
      }
  }

  return {
    isChanged,
    changedTask
  };
};

const handleTaskBySVGMouseEventForMilestone = (svgX, action, selectedTask, xStep, timeStep, initEventX1Delta) => {
  const changedTask = { ...selectedTask
  };
  let isChanged = false;

  switch (action) {
    case "move":
      {
        const [newMoveX1, newMoveX2] = moveByX(svgX - initEventX1Delta, xStep, selectedTask);
        isChanged = newMoveX1 !== selectedTask.x1;

        if (isChanged) {
          changedTask.start = dateByX(newMoveX1, selectedTask.x1, selectedTask.start, xStep, timeStep);
          changedTask.end = changedTask.start;
          changedTask.x1 = newMoveX1;
          changedTask.x2 = newMoveX2;
        }

        break;
      }
  }

  return {
    isChanged,
    changedTask
  };
};

function isKeyboardEvent(event) {
  return event.key !== undefined;
}
function removeHiddenTasks(tasks) {
  const groupedTasks = tasks.filter(t => t.hideChildren && t.type === "project");

  if (groupedTasks.length > 0) {
    for (let i = 0; groupedTasks.length > i; i++) {
      const groupedTask = groupedTasks[i];
      const children = getChildren(tasks, groupedTask);
      tasks = tasks.filter(t => children.indexOf(t) === -1);
    }
  }

  return tasks;
}

function getChildren(taskList, task) {
  let tasks = [];

  if (task.type !== "project") {
    tasks = taskList.filter(t => t.dependencies && t.dependencies.indexOf(task.id) !== -1);
  } else {
    tasks = taskList.filter(t => t.project && t.project === task.id);
  }

  var taskChildren = [];
  tasks.forEach(t => {
    taskChildren.push(...getChildren(taskList, t));
  });
  tasks = tasks.concat(tasks, taskChildren);
  return tasks;
}

const sortTasks = (taskA, taskB) => {
  const orderA = taskA.displayOrder || Number.MAX_VALUE;
  const orderB = taskB.displayOrder || Number.MAX_VALUE;

  if (orderA > orderB) {
    return 1;
  } else if (orderA < orderB) {
    return -1;
  } else {
    return 0;
  }
};

var styles$6 = {"barWrapper":"_KxSXS","barHandle":"_3w_5u","barBackground":"_31ERP"};

const BarDisplay = _ref => {
  let {
    x,
    y,
    width,
    height,
    isSelected,
    progressX,
    progressWidth,
    barCornerRadius,
    styles,
    onMouseDown
  } = _ref;

  const getProcessColor = () => {
    return isSelected ? styles.progressSelectedColor : styles.progressColor;
  };

  const getBarColor = () => {
    return isSelected ? styles.backgroundSelectedColor : styles.backgroundColor;
  };

  return React.createElement("g", {
    onMouseDown: onMouseDown
  }, React.createElement("rect", {
    x: x,
    width: width,
    y: y,
    height: height,
    ry: barCornerRadius,
    rx: barCornerRadius,
    fill: getBarColor(),
    className: styles$6.barBackground
  }), React.createElement("rect", {
    x: progressX,
    width: progressWidth,
    y: y,
    height: height,
    ry: barCornerRadius,
    rx: barCornerRadius,
    fill: getProcessColor()
  }));
};

const BarDateHandle = _ref => {
  let {
    x,
    y,
    width,
    height,
    barCornerRadius,
    onMouseDown
  } = _ref;
  return React.createElement("rect", {
    x: x,
    y: y,
    width: width,
    height: height,
    className: styles$6.barHandle,
    ry: barCornerRadius,
    rx: barCornerRadius,
    onMouseDown: onMouseDown
  });
};

const BarProgressHandle = _ref => {
  let {
    progressPoint,
    onMouseDown
  } = _ref;
  return React.createElement("polygon", {
    className: styles$6.barHandle,
    points: progressPoint,
    onMouseDown: onMouseDown
  });
};

const Bar = _ref => {
  let {
    task,
    isProgressChangeable,
    isDateChangeable,
    rtl,
    onEventStart,
    isSelected
  } = _ref;
  const progressPoint = getProgressPoint(+!rtl * task.progressWidth + task.progressX, task.y, task.height);
  const handleHeight = task.height - 2;
  return React.createElement("g", {
    className: styles$6.barWrapper,
    tabIndex: 0
  }, React.createElement(BarDisplay, {
    x: task.x1,
    y: task.y,
    width: task.x2 - task.x1,
    height: task.height,
    progressX: task.progressX,
    progressWidth: task.progressWidth,
    barCornerRadius: task.barCornerRadius,
    styles: task.styles,
    isSelected: isSelected,
    onMouseDown: e => {
      isDateChangeable && onEventStart("move", task, e);
    }
  }), React.createElement("g", {
    className: "handleGroup"
  }, isDateChangeable && React.createElement("g", null, React.createElement(BarDateHandle, {
    x: task.x1 + 1,
    y: task.y + 1,
    width: task.handleWidth,
    height: handleHeight,
    barCornerRadius: task.barCornerRadius,
    onMouseDown: e => {
      onEventStart("start", task, e);
    }
  }), React.createElement(BarDateHandle, {
    x: task.x2 - task.handleWidth - 1,
    y: task.y + 1,
    width: task.handleWidth,
    height: handleHeight,
    barCornerRadius: task.barCornerRadius,
    onMouseDown: e => {
      onEventStart("end", task, e);
    }
  })), isProgressChangeable && React.createElement(BarProgressHandle, {
    progressPoint: progressPoint,
    onMouseDown: e => {
      onEventStart("progress", task, e);
    }
  })));
};

const BarSmall = _ref => {
  let {
    task,
    isProgressChangeable,
    isDateChangeable,
    onEventStart,
    isSelected
  } = _ref;
  const progressPoint = getProgressPoint(task.progressWidth + task.x1, task.y, task.height);
  return React.createElement("g", {
    className: styles$6.barWrapper,
    tabIndex: 0
  }, React.createElement(BarDisplay, {
    x: task.x1,
    y: task.y,
    width: task.x2 - task.x1,
    height: task.height,
    progressX: task.progressX,
    progressWidth: task.progressWidth,
    barCornerRadius: task.barCornerRadius,
    styles: task.styles,
    isSelected: isSelected,
    onMouseDown: e => {
      isDateChangeable && onEventStart("move", task, e);
    }
  }), React.createElement("g", {
    className: "handleGroup"
  }, isProgressChangeable && React.createElement(BarProgressHandle, {
    progressPoint: progressPoint,
    onMouseDown: e => {
      onEventStart("progress", task, e);
    }
  })));
};

var styles$7 = {"milestoneWrapper":"_RRr13","milestoneBackground":"_2P2B1"};

const Milestone = _ref => {
  let {
    task,
    isDateChangeable,
    onEventStart,
    isSelected
  } = _ref;
  const transform = `rotate(45 ${task.x1 + task.height * 0.356} 
    ${task.y + task.height * 0.85})`;

  const getBarColor = () => {
    return isSelected ? task.styles.backgroundSelectedColor : task.styles.backgroundColor;
  };

  return React.createElement("g", {
    tabIndex: 0,
    className: styles$7.milestoneWrapper
  }, React.createElement("rect", {
    fill: getBarColor(),
    x: task.x1,
    width: task.height,
    y: task.y,
    height: task.height,
    rx: task.barCornerRadius,
    ry: task.barCornerRadius,
    transform: transform,
    className: styles$7.milestoneBackground,
    onMouseDown: e => {
      isDateChangeable && onEventStart("move", task, e);
    }
  }));
};

var styles$8 = {"projectWrapper":"_1KJ6x","projectBackground":"_2RbVy","projectTop":"_2pZMF"};

const Project = _ref => {
  let {
    task,
    isSelected
  } = _ref;
  const barColor = isSelected ? task.styles.backgroundSelectedColor : task.styles.backgroundColor;
  const processColor = isSelected ? task.styles.progressSelectedColor : task.styles.progressColor;
  const projectWith = task.x2 - task.x1;
  const projectLeftTriangle = [task.x1, task.y + task.height / 2 - 1, task.x1, task.y + task.height, task.x1 + 15, task.y + task.height / 2 - 1].join(",");
  const projectRightTriangle = [task.x2, task.y + task.height / 2 - 1, task.x2, task.y + task.height, task.x2 - 15, task.y + task.height / 2 - 1].join(",");
  return React.createElement("g", {
    tabIndex: 0,
    className: styles$8.projectWrapper
  }, React.createElement("rect", {
    fill: barColor,
    x: task.x1,
    width: projectWith,
    y: task.y,
    height: task.height,
    rx: task.barCornerRadius,
    ry: task.barCornerRadius,
    className: styles$8.projectBackground
  }), React.createElement("rect", {
    x: task.progressX,
    width: task.progressWidth,
    y: task.y,
    height: task.height,
    ry: task.barCornerRadius,
    rx: task.barCornerRadius,
    fill: processColor
  }), React.createElement("rect", {
    fill: barColor,
    x: task.x1,
    width: projectWith,
    y: task.y,
    height: task.height / 2,
    rx: task.barCornerRadius,
    ry: task.barCornerRadius,
    className: styles$8.projectTop
  }), React.createElement("polygon", {
    className: styles$8.projectTop,
    points: projectLeftTriangle,
    fill: barColor
  }), React.createElement("polygon", {
    className: styles$8.projectTop,
    points: projectRightTriangle,
    fill: barColor
  }));
};

var style = {"barLabel":"_3zRJQ","barLabelOutside":"_3KcaM"};

const TaskItem = props => {
  const {
    task,
    arrowIndent,
    isDelete,
    taskHeight,
    isSelected,
    rtl,
    onEventStart
  } = { ...props
  };
  const textRef = useRef(null);
  const [taskItem, setTaskItem] = useState(React.createElement("div", null));
  const [isTextInside, setIsTextInside] = useState(true);
  useEffect(() => {
    switch (task.typeInternal) {
      case "milestone":
        setTaskItem(React.createElement(Milestone, Object.assign({}, props)));
        break;

      case "project":
        setTaskItem(React.createElement(Project, Object.assign({}, props)));
        break;

      case "smalltask":
        setTaskItem(React.createElement(BarSmall, Object.assign({}, props)));
        break;

      default:
        setTaskItem(React.createElement(Bar, Object.assign({}, props)));
        break;
    }
  }, [task, isSelected]);
  useEffect(() => {
    if (textRef.current) {
      setIsTextInside(textRef.current.getBBox().width < task.x2 - task.x1);
    }
  }, [textRef, task]);

  const getX = () => {
    const width = task.x2 - task.x1;
    const hasChild = task.barChildren.length > 0;

    if (isTextInside) {
      return task.x1 + width * 0.5;
    }

    if (rtl && textRef.current) {
      return task.x1 - textRef.current.getBBox().width - arrowIndent * +hasChild - arrowIndent * 0.2;
    } else {
      return task.x1 + width + arrowIndent * +hasChild + arrowIndent * 0.2;
    }
  };

  return React.createElement("g", {
    onKeyDown: e => {
      switch (e.key) {
        case "Delete":
          {
            if (isDelete) onEventStart("delete", task, e);
            break;
          }
      }

      e.stopPropagation();
    },
    onMouseEnter: e => {
      onEventStart("mouseenter", task, e);
    },
    onMouseLeave: e => {
      onEventStart("mouseleave", task, e);
    },
    onDoubleClick: e => {
      onEventStart("dblclick", task, e);
    },
    onClick: e => {
      onEventStart("click", task, e);
    },
    onFocus: () => {
      onEventStart("select", task);
    }
  }, taskItem, React.createElement("text", {
    x: getX(),
    y: task.y + taskHeight * 0.5,
    className: isTextInside ? style.barLabel :  style.barLabelOutside,
    ref: textRef
  }, task.name));
};

const TaskGanttContent = _ref => {
  var _svg$current;

  let {
    tasks,
    dates,
    ganttEvent,
    selectedTask,
    rowHeight,
    columnWidth,
    timeStep,
    svg,
    taskHeight,
    arrowColor,
    arrowIndent,
    fontFamily,
    fontSize,
    rtl,
    setGanttEvent,
    setFailedTask,
    setSelectedTask,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete
  } = _ref;
  const point = svg === null || svg === void 0 ? void 0 : (_svg$current = svg.current) === null || _svg$current === void 0 ? void 0 : _svg$current.createSVGPoint();
  const [xStep, setXStep] = useState(0);
  const [initEventX1Delta, setInitEventX1Delta] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  useEffect(() => {
    const dateDelta = dates[1].getTime() - dates[0].getTime() - dates[1].getTimezoneOffset() * 60 * 1000 + dates[0].getTimezoneOffset() * 60 * 1000;
    const newXStep = timeStep * columnWidth / dateDelta;
    setXStep(newXStep);
  }, [columnWidth, dates, timeStep]);
  useEffect(() => {
    const handleMouseMove = function (event) {
      try {
        var _svg$current$getScree;

        if (!ganttEvent.changedTask || !point || !(svg !== null && svg !== void 0 && svg.current)) return Promise.resolve();
        event.preventDefault();
        point.x = event.clientX;
        const cursor = point.matrixTransform(svg === null || svg === void 0 ? void 0 : (_svg$current$getScree = svg.current.getScreenCTM()) === null || _svg$current$getScree === void 0 ? void 0 : _svg$current$getScree.inverse());
        const {
          isChanged,
          changedTask
        } = handleTaskBySVGMouseEvent(cursor.x, ganttEvent.action, ganttEvent.changedTask, xStep, timeStep, initEventX1Delta, rtl);

        if (isChanged) {
          setGanttEvent({
            action: ganttEvent.action,
            changedTask
          });
        }

        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const handleMouseUp = function (event) {
      try {
        var _svg$current$getScree2;

        function _temp5() {
          if (!operationSuccess) {
            setFailedTask(originalSelectedTask);
          }
        }

        const {
          action,
          originalSelectedTask,
          changedTask
        } = ganttEvent;
        if (!changedTask || !point || !(svg !== null && svg !== void 0 && svg.current) || !originalSelectedTask) return Promise.resolve();
        event.preventDefault();
        point.x = event.clientX;
        const cursor = point.matrixTransform(svg === null || svg === void 0 ? void 0 : (_svg$current$getScree2 = svg.current.getScreenCTM()) === null || _svg$current$getScree2 === void 0 ? void 0 : _svg$current$getScree2.inverse());
        const {
          changedTask: newChangedTask
        } = handleTaskBySVGMouseEvent(cursor.x, action, changedTask, xStep, timeStep, initEventX1Delta, rtl);
        const isNotLikeOriginal = originalSelectedTask.start !== newChangedTask.start || originalSelectedTask.end !== newChangedTask.end || originalSelectedTask.progress !== newChangedTask.progress;
        svg.current.removeEventListener("mousemove", handleMouseMove);
        svg.current.removeEventListener("mouseup", handleMouseUp);
        setGanttEvent({
          action: ""
        });
        setIsMoving(false);
        let operationSuccess = true;

        const _temp4 = function () {
          if ((action === "move" || action === "end" || action === "start") && onDateChange && isNotLikeOriginal) {
            const _temp = _catch(function () {
              return Promise.resolve(onDateChange(newChangedTask, newChangedTask.barChildren)).then(function (result) {
                if (result !== undefined) {
                  operationSuccess = result;
                }
              });
            }, function () {
              operationSuccess = false;
            });

            if (_temp && _temp.then) return _temp.then(function () {});
          } else {
            const _temp3 = function () {
              if (onProgressChange && isNotLikeOriginal) {
                const _temp2 = _catch(function () {
                  return Promise.resolve(onProgressChange(newChangedTask, newChangedTask.barChildren)).then(function (result) {
                    if (result !== undefined) {
                      operationSuccess = result;
                    }
                  });
                }, function () {
                  operationSuccess = false;
                });

                if (_temp2 && _temp2.then) return _temp2.then(function () {});
              }
            }();

            if (_temp3 && _temp3.then) return _temp3.then(function () {});
          }
        }();

        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp5) : _temp5(_temp4));
      } catch (e) {
        return Promise.reject(e);
      }
    };

    if (!isMoving && (ganttEvent.action === "move" || ganttEvent.action === "end" || ganttEvent.action === "start" || ganttEvent.action === "progress") && svg !== null && svg !== void 0 && svg.current) {
      svg.current.addEventListener("mousemove", handleMouseMove);
      svg.current.addEventListener("mouseup", handleMouseUp);
      setIsMoving(true);
    }
  }, [ganttEvent, xStep, initEventX1Delta, onProgressChange, timeStep, onDateChange, svg, isMoving, point, rtl, setFailedTask, setGanttEvent]);

  const handleBarEventStart = function (action, task, event) {
    try {
      return Promise.resolve(function () {
        if (!event) {
          if (action === "select") {
            setSelectedTask(task.id);
          }
        } else return function () {
          if (isKeyboardEvent(event)) {
            const _temp8 = function () {
              if (action === "delete") {
                const _temp7 = function () {
                  if (onDelete) {
                    const _temp6 = _catch(function () {
                      return Promise.resolve(onDelete(task)).then(function (result) {
                        if (result !== undefined && result) {
                          setGanttEvent({
                            action,
                            changedTask: task
                          });
                        }
                      });
                    }, function (error) {
                      console.error("Error on Delete. " + error);
                    });

                    if (_temp6 && _temp6.then) return _temp6.then(function () {});
                  }
                }();

                if (_temp7 && _temp7.then) return _temp7.then(function () {});
              }
            }();

            if (_temp8 && _temp8.then) return _temp8.then(function () {});
          } else if (action === "mouseenter") {
            if (!ganttEvent.action) {
              setGanttEvent({
                action,
                changedTask: task,
                originalSelectedTask: task
              });
            }
          } else if (action === "mouseleave") {
            if (ganttEvent.action === "mouseenter") {
              setGanttEvent({
                action: ""
              });
            }
          } else if (action === "dblclick") {
            !!onDoubleClick && onDoubleClick(task);
          } else if (action === "click") {
            !!onClick && onClick(task);
          } else if (action === "move") {
            var _svg$current$getScree3;

            if (!(svg !== null && svg !== void 0 && svg.current) || !point) return;
            point.x = event.clientX;
            const cursor = point.matrixTransform((_svg$current$getScree3 = svg.current.getScreenCTM()) === null || _svg$current$getScree3 === void 0 ? void 0 : _svg$current$getScree3.inverse());
            setInitEventX1Delta(cursor.x - task.x1);
            setGanttEvent({
              action,
              changedTask: task,
              originalSelectedTask: task
            });
          } else {
            setGanttEvent({
              action,
              changedTask: task,
              originalSelectedTask: task
            });
          }
        }();
      }());
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return React.createElement("g", {
    className: "content"
  }, React.createElement("g", {
    className: "arrows",
    fill: arrowColor,
    stroke: arrowColor
  }, tasks.map(task => {
    return task.barChildren.map(child => {
      return React.createElement(Arrow, {
        key: `Arrow from ${task.id} to ${tasks[child.index].id}`,
        taskFrom: task,
        taskTo: tasks[child.index],
        rowHeight: rowHeight,
        taskHeight: taskHeight,
        arrowIndent: arrowIndent,
        rtl: rtl
      });
    });
  })), React.createElement("g", {
    className: "bar",
    fontFamily: fontFamily,
    fontSize: fontSize
  }, tasks.map(task => {
    return React.createElement(TaskItem, {
      task: task,
      arrowIndent: arrowIndent,
      taskHeight: taskHeight,
      isProgressChangeable: !!onProgressChange && !task.isDisabled,
      isDateChangeable: !!onDateChange && !task.isDisabled,
      isDelete: !task.isDisabled,
      onEventStart: handleBarEventStart,
      key: task.id,
      isSelected: !!selectedTask && task.id === selectedTask.id,
      rtl: rtl
    });
  })));
};

var styles$9 = {"ganttVerticalContainer":"_CZjuD","horizontalContainer":"_2B2zv","wrapper":"_3eULf"};

const TaskGantt = _ref => {
  let {
    gridProps,
    calendarProps,
    barProps,
    ganttHeight,
    scrollY,
    scrollX
  } = _ref;
  const ganttSVGRef = useRef(null);
  const horizontalContainerRef = useRef(null);
  const verticalGanttContainerRef = useRef(null);
  const newBarProps = { ...barProps,
    svg: ganttSVGRef
  };
  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);
  useEffect(() => {
    if (verticalGanttContainerRef.current) {
      verticalGanttContainerRef.current.scrollLeft = scrollX;
    }
  }, [scrollX]);
  return React.createElement("div", {
    className: styles$9.ganttVerticalContainer,
    ref: verticalGanttContainerRef,
    dir: "ltr"
  }, React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: gridProps.svgWidth,
    height: calendarProps.headerHeight,
    fontFamily: barProps.fontFamily
  }, React.createElement(Calendar, Object.assign({}, calendarProps))), React.createElement("div", {
    ref: horizontalContainerRef,
    className: styles$9.horizontalContainer,
    style: ganttHeight ? {
      height: ganttHeight,
      width: gridProps.svgWidth
    } : {
      width: gridProps.svgWidth
    }
  }, React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: gridProps.svgWidth,
    height: barProps.rowHeight * barProps.tasks.length,
    fontFamily: barProps.fontFamily,
    ref: ganttSVGRef
  }, React.createElement(Grid, Object.assign({}, gridProps)), React.createElement(TaskGanttContent, Object.assign({}, newBarProps)))));
};

var styles$a = {"scrollWrapper":"_2k9Ys","scroll":"_19jgW"};

const HorizontalScroll = _ref => {
  let {
    scroll,
    svgWidth,
    taskListWidth,
    rtl,
    onScroll
  } = _ref;
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scroll;
    }
  }, [scroll]);
  return React.createElement("div", {
    dir: "ltr",
    style: {
      margin: rtl ? "0px " + taskListWidth + "px 0px 0px" : "0px 0px 0px " + taskListWidth + "px"
    },
    className: styles$a.scrollWrapper,
    onScroll: onScroll,
    ref: scrollRef
  }, React.createElement("div", {
    style: {
      width: svgWidth
    },
    className: styles$a.scroll
  }));
};

const Gantt = _ref => {
  let {
    tasks,
    headerHeight = 50,
    columnWidth = 60,
    listCellWidth = "155px",
    rowHeight = 50,
    ganttHeight = 0,
    viewMode = ViewMode.Day,
    preStepsCount = 1,
    locale = "en-GB",
    barFill = 60,
    barCornerRadius = 3,
    barProgressColor = "#a3a3ff",
    barProgressSelectedColor = "#8282f5",
    barBackgroundColor = "#b8c2cc",
    barBackgroundSelectedColor = "#aeb8c2",
    projectProgressColor = "#7db59a",
    projectProgressSelectedColor = "#59a985",
    projectBackgroundColor = "#fac465",
    projectBackgroundSelectedColor = "#f7bb53",
    milestoneBackgroundColor = "#f1c453",
    milestoneBackgroundSelectedColor = "#f29e4c",
    rtl = false,
    handleWidth = 8,
    timeStep = 300000,
    arrowColor = "grey",
    fontFamily = "Arial, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
    fontSize = "14px",
    arrowIndent = 20,
    todayColor = "rgba(252, 248, 227, 0.5)",
    viewDate,
    TooltipContent = StandardTooltipContent,
    TaskListHeader = TaskListHeaderDefault,
    TaskListTable = TaskListTableDefault,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete,
    onSelect,
    onExpanderClick
  } = _ref;
  const wrapperRef = useRef(null);
  const taskListRef = useRef(null);
  const [dateSetup, setDateSetup] = useState(() => {
    const [startDate, endDate] = ganttDateRange(tasks, viewMode, preStepsCount);
    return {
      viewMode,
      dates: seedDates(startDate, endDate, viewMode)
    };
  });
  const [currentViewDate, setCurrentViewDate] = useState(undefined);
  const [taskListWidth, setTaskListWidth] = useState(0);
  const [svgContainerWidth, setSvgContainerWidth] = useState(0);
  const [svgContainerHeight, setSvgContainerHeight] = useState(ganttHeight);
  const [barTasks, setBarTasks] = useState([]);
  const [ganttEvent, setGanttEvent] = useState({
    action: ""
  });
  const taskHeight = useMemo(() => rowHeight * barFill / 100, [rowHeight, barFill]);
  const [selectedTask, setSelectedTask] = useState();
  const [failedTask, setFailedTask] = useState(null);
  const svgWidth = dateSetup.dates.length * columnWidth;
  const ganttFullHeight = barTasks.length * rowHeight;
  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(-1);
  const [ignoreScrollEvent, setIgnoreScrollEvent] = useState(false);
  useEffect(() => {
    let filteredTasks;

    if (onExpanderClick) {
      filteredTasks = removeHiddenTasks(tasks);
    } else {
      filteredTasks = tasks;
    }

    filteredTasks = filteredTasks.sort(sortTasks);
    const [startDate, endDate] = ganttDateRange(filteredTasks, viewMode, preStepsCount);
    let newDates = seedDates(startDate, endDate, viewMode);

    if (rtl) {
      newDates = newDates.reverse();

      if (scrollX === -1) {
        setScrollX(newDates.length * columnWidth);
      }
    }

    setDateSetup({
      dates: newDates,
      viewMode
    });
    setBarTasks(convertToBarTasks(filteredTasks, newDates, columnWidth, rowHeight, taskHeight, barCornerRadius, handleWidth, rtl, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor, projectProgressColor, projectProgressSelectedColor, projectBackgroundColor, projectBackgroundSelectedColor, milestoneBackgroundColor, milestoneBackgroundSelectedColor));
  }, [tasks, viewMode, preStepsCount, rowHeight, barCornerRadius, columnWidth, taskHeight, handleWidth, barProgressColor, barProgressSelectedColor, barBackgroundColor, barBackgroundSelectedColor, projectProgressColor, projectProgressSelectedColor, projectBackgroundColor, projectBackgroundSelectedColor, milestoneBackgroundColor, milestoneBackgroundSelectedColor, rtl, scrollX, onExpanderClick]);
  useEffect(() => {
    if (viewMode === dateSetup.viewMode && (viewDate && !currentViewDate || viewDate && (currentViewDate === null || currentViewDate === void 0 ? void 0 : currentViewDate.valueOf()) !== viewDate.valueOf())) {
      const dates = dateSetup.dates;
      const index = dates.findIndex((d, i) => viewDate.valueOf() >= d.valueOf() && i + 1 !== dates.length && viewDate.valueOf() < dates[i + 1].valueOf());

      if (index === -1) {
        return;
      }

      setCurrentViewDate(viewDate);
      setScrollX(columnWidth * index);
    }
  }, [viewDate, columnWidth, dateSetup.dates, dateSetup.viewMode, viewMode, currentViewDate, setCurrentViewDate]);
  useEffect(() => {
    const {
      changedTask,
      action
    } = ganttEvent;

    if (changedTask) {
      if (action === "delete") {
        setGanttEvent({
          action: ""
        });
        setBarTasks(barTasks.filter(t => t.id !== changedTask.id));
      } else if (action === "move" || action === "end" || action === "start" || action === "progress") {
        const prevStateTask = barTasks.find(t => t.id === changedTask.id);

        if (prevStateTask && (prevStateTask.start.getTime() !== changedTask.start.getTime() || prevStateTask.end.getTime() !== changedTask.end.getTime() || prevStateTask.progress !== changedTask.progress)) {
          const newTaskList = barTasks.map(t => t.id === changedTask.id ? changedTask : t);
          setBarTasks(newTaskList);
        }
      }
    }
  }, [ganttEvent, barTasks]);
  useEffect(() => {
    if (failedTask) {
      setBarTasks(barTasks.map(t => t.id !== failedTask.id ? t : failedTask));
      setFailedTask(null);
    }
  }, [failedTask, barTasks]);
  useEffect(() => {
    if (!listCellWidth) {
      setTaskListWidth(0);
    }

    if (taskListRef.current) {
      setTaskListWidth(taskListRef.current.offsetWidth);
    }
  }, [taskListRef, listCellWidth]);
  useEffect(() => {
    if (wrapperRef.current) {
      setSvgContainerWidth(wrapperRef.current.offsetWidth - taskListWidth);
    }
  }, [wrapperRef, taskListWidth]);
  useEffect(() => {
    if (ganttHeight) {
      setSvgContainerHeight(ganttHeight + headerHeight);
    } else {
      setSvgContainerHeight(tasks.length * rowHeight + headerHeight);
    }
  }, [ganttHeight, tasks, headerHeight, rowHeight]);
  useEffect(() => {
    var _wrapperRef$current;

    const handleWheel = event => {
      if (event.shiftKey || event.deltaX) {
        const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
        let newScrollX = scrollX + scrollMove;

        if (newScrollX < 0) {
          newScrollX = 0;
        } else if (newScrollX > svgWidth) {
          newScrollX = svgWidth;
        }

        setScrollX(newScrollX);
        event.preventDefault();
      } else if (ganttHeight) {
        let newScrollY = scrollY + event.deltaY;

        if (newScrollY < 0) {
          newScrollY = 0;
        } else if (newScrollY > ganttFullHeight - ganttHeight) {
          newScrollY = ganttFullHeight - ganttHeight;
        }

        if (newScrollY !== scrollY) {
          setScrollY(newScrollY);
          event.preventDefault();
        }
      }

      setIgnoreScrollEvent(true);
    };

    (_wrapperRef$current = wrapperRef.current) === null || _wrapperRef$current === void 0 ? void 0 : _wrapperRef$current.addEventListener("wheel", handleWheel, {
      passive: false
    });
    return () => {
      var _wrapperRef$current2;

      (_wrapperRef$current2 = wrapperRef.current) === null || _wrapperRef$current2 === void 0 ? void 0 : _wrapperRef$current2.removeEventListener("wheel", handleWheel);
    };
  }, [wrapperRef, scrollY, scrollX, ganttHeight, svgWidth, rtl, ganttFullHeight]);

  const handleScrollY = event => {
    if (scrollY !== event.currentTarget.scrollTop && !ignoreScrollEvent) {
      setScrollY(event.currentTarget.scrollTop);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  const handleScrollX = event => {
    if (scrollX !== event.currentTarget.scrollLeft && !ignoreScrollEvent) {
      setScrollX(event.currentTarget.scrollLeft);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  const handleKeyDown = event => {
    event.preventDefault();
    let newScrollY = scrollY;
    let newScrollX = scrollX;
    let isX = true;

    switch (event.key) {
      case "Down":
      case "ArrowDown":
        newScrollY += rowHeight;
        isX = false;
        break;

      case "Up":
      case "ArrowUp":
        newScrollY -= rowHeight;
        isX = false;
        break;

      case "Left":
      case "ArrowLeft":
        newScrollX -= columnWidth;
        break;

      case "Right":
      case "ArrowRight":
        newScrollX += columnWidth;
        break;
    }

    if (isX) {
      if (newScrollX < 0) {
        newScrollX = 0;
      } else if (newScrollX > svgWidth) {
        newScrollX = svgWidth;
      }

      setScrollX(newScrollX);
    } else {
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight - ganttHeight) {
        newScrollY = ganttFullHeight - ganttHeight;
      }

      setScrollY(newScrollY);
    }

    setIgnoreScrollEvent(true);
  };

  const handleSelectedTask = taskId => {
    const newSelectedTask = barTasks.find(t => t.id === taskId);
    const oldSelectedTask = barTasks.find(t => !!selectedTask && t.id === selectedTask.id);

    if (onSelect) {
      if (oldSelectedTask) {
        onSelect(oldSelectedTask, false);
      }

      if (newSelectedTask) {
        onSelect(newSelectedTask, true);
      }
    }

    setSelectedTask(newSelectedTask);
  };

  const handleExpanderClick = task => {
    if (onExpanderClick && task.hideChildren !== undefined) {
      onExpanderClick({ ...task,
        hideChildren: !task.hideChildren
      });
    }
  };

  const gridProps = {
    columnWidth,
    svgWidth,
    tasks: tasks,
    rowHeight,
    dates: dateSetup.dates,
    todayColor,
    rtl
  };
  const calendarProps = {
    dateSetup,
    locale,
    viewMode,
    headerHeight,
    columnWidth,
    fontFamily,
    fontSize,
    rtl
  };
  const barProps = {
    tasks: barTasks,
    dates: dateSetup.dates,
    ganttEvent,
    selectedTask,
    rowHeight,
    taskHeight,
    columnWidth,
    arrowColor,
    timeStep,
    fontFamily,
    fontSize,
    arrowIndent,
    svgWidth,
    rtl,
    setGanttEvent,
    setFailedTask,
    setSelectedTask: handleSelectedTask,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete
  };
  const tableProps = {
    rowHeight,
    rowWidth: listCellWidth,
    fontFamily,
    fontSize,
    tasks: barTasks,
    locale,
    headerHeight,
    scrollY,
    ganttHeight,
    horizontalContainerClass: styles$9.horizontalContainer,
    selectedTask,
    taskListRef,
    setSelectedTask: handleSelectedTask,
    onExpanderClick: handleExpanderClick,
    TaskListHeader,
    TaskListTable
  };
  return React.createElement("div", null, React.createElement("div", {
    className: styles$9.wrapper,
    onKeyDown: handleKeyDown,
    tabIndex: 0,
    ref: wrapperRef
  }, listCellWidth && React.createElement(TaskList, Object.assign({}, tableProps)), React.createElement(TaskGantt, {
    gridProps: gridProps,
    calendarProps: calendarProps,
    barProps: barProps,
    ganttHeight: ganttHeight,
    scrollY: scrollY,
    scrollX: scrollX
  }), ganttEvent.changedTask && React.createElement(Tooltip, {
    arrowIndent: arrowIndent,
    rowHeight: rowHeight,
    svgContainerHeight: svgContainerHeight,
    svgContainerWidth: svgContainerWidth,
    fontFamily: fontFamily,
    fontSize: fontSize,
    scrollX: scrollX,
    scrollY: scrollY,
    task: ganttEvent.changedTask,
    headerHeight: headerHeight,
    taskListWidth: taskListWidth,
    TooltipContent: TooltipContent,
    rtl: rtl,
    svgWidth: svgWidth
  }), React.createElement(VerticalScroll, {
    ganttFullHeight: ganttFullHeight,
    ganttHeight: ganttHeight,
    headerHeight: headerHeight,
    scroll: scrollY,
    onScroll: handleScrollY,
    rtl: rtl
  })), React.createElement(HorizontalScroll, {
    svgWidth: svgWidth,
    taskListWidth: taskListWidth,
    scroll: scrollX,
    rtl: rtl,
    onScroll: handleScrollX
  }));
};

export { Gantt, ViewMode };
//# sourceMappingURL=index.modern.js.map
