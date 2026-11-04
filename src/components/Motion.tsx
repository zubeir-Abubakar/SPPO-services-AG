"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { RefCallback } from "react";

type RevealTag = "h1" | "h2" | "h3" | "h4" | "p" | "span";

export function MaskedText({
  as: Tag = "p",
  children,
  className,
}: {
  as?: RevealTag;
  children: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const sourceRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<string[]>();
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const source = sourceRef.current;
    const textNode = source?.firstChild;
    if (
      lines ||
      !root ||
      !source ||
      !textNode ||
      textNode.nodeType !== Node.TEXT_NODE
    ) {
      return;
    }

    const groups: { top: number; words: string[] }[] = [];
    for (const word of children.matchAll(/\S+/g)) {
      const range = document.createRange();
      range.setStart(textNode, word.index);
      range.setEnd(textNode, word.index + word[0].length);
      const top = range.getBoundingClientRect().top;
      const line = groups.find((group) => Math.abs(group.top - top) < 2);
      if (line) line.words.push(word[0]);
      else groups.push({ top, words: [word[0]] });
    }
    if (groups.length) setLines(groups.map((group) => group.words.join(" ")));
  }, [children, lines]);

  useEffect(() => {
    if (!lines?.length || !("ResizeObserver" in window)) return;
    const root = rootRef.current;
    if (!root) return;
    let width = root.getBoundingClientRect().width;
    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = root.getBoundingClientRect().width;
      if (Math.abs(nextWidth - width) < 1) return;
      width = nextWidth;
      setLines(undefined);
    });
    resizeObserver.observe(root);
    return () => resizeObserver.disconnect();
  }, [lines]);

  useEffect(() => {
    if (!lines?.length) return;
    const root = rootRef.current;
    if (!root) return;
    let hasRevealed = false;
    let checkFrame = 0;
    let observer: IntersectionObserver | undefined;

    const cleanupListeners = () => {
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleVisibilityCheck);
      window.removeEventListener("resize", scheduleVisibilityCheck);
      if (checkFrame) cancelAnimationFrame(checkFrame);
    };
    const reveal = () => {
      if (hasRevealed) return;
      hasRevealed = true;
      setVisible(true);
      cleanupListeners();
    };
    const checkVisibility = () => {
      checkFrame = 0;
      const bounds = root.getBoundingClientRect();
      if (bounds.top < window.innerHeight * 0.9 && bounds.bottom > 0) reveal();
    };
    function scheduleVisibilityCheck() {
      if (!checkFrame) checkFrame = requestAnimationFrame(checkVisibility);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return cleanupListeners;
    }
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) reveal();
        },
        { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
      );
      observer.observe(root);
    }
    window.addEventListener("scroll", scheduleVisibilityCheck, { passive: true });
    window.addEventListener("resize", scheduleVisibilityCheck);
    checkVisibility();
    return cleanupListeners;
  }, [lines]);

  const TagName = Tag;
  const setRootRef: RefCallback<HTMLElement> = (element) => {
    rootRef.current = element;
  };
  return (
    <TagName
      ref={setRootRef}
      className={`text-reveal${className ? ` ${className}` : ""}`}
      data-armed={lines?.length ? "true" : undefined}
      data-visible={visible ? "true" : undefined}
      aria-label={children}
    >
      {!lines && (
        <span ref={sourceRef} className="text-reveal-source" aria-hidden="true">
          {children}
        </span>
      )}
      {lines && (
        <span className="text-reveal-lines" aria-hidden="true">
          {lines.map((line, index) => (
            <span className="text-reveal-line" key={`${index}-${line}`}>
              <span style={{ transitionDelay: `${Math.min(index * 38, 342)}ms` }}>
                {line}
              </span>
            </span>
          ))}
        </span>
      )}
    </TagName>
  );
}

export type Milestone = {
  value: number;
  suffix?: string;
  label: string;
};

export function MilestoneStats({
  milestones,
  label,
}: {
  milestones: Milestone[];
  label: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const milestoneRef = useRef(milestones);
  const [values, setValues] = useState(() =>
    milestoneRef.current.map(({ value }) => value),
  );

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setValues(milestoneRef.current.map(() => 0));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let animationFrame = 0;
    let checkFrame = 0;
    let startedAt: number | undefined;
    let hasStarted = false;
    const duration = 1500;
    let observer: IntersectionObserver | undefined;

    const animate = (time: number) => {
      if (startedAt === undefined) startedAt = time;
      const progress = Math.min((time - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValues(milestoneRef.current.map(({ value }) => Math.round(value * eased)));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    const start = () => {
      if (hasStarted) return;
      hasStarted = true;
      animationFrame = requestAnimationFrame(animate);
    };
    const checkVisibility = () => {
      checkFrame = 0;
      const bounds = section.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) start();
    };
    const scheduleVisibilityCheck = () => {
      if (!checkFrame) checkFrame = requestAnimationFrame(checkVisibility);
    };
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) start();
        },
        { threshold: 0.25 },
      );
      observer.observe(section);
    }
    window.addEventListener("scroll", scheduleVisibilityCheck, { passive: true });
    window.addEventListener("resize", scheduleVisibilityCheck);
    checkVisibility();
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finishWithoutMotion = () => {
      if (!preference.matches) return;
      hasStarted = true;
      observer?.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
      setValues(milestoneRef.current.map(({ value }) => value));
    };
    preference.addEventListener("change", finishWithoutMotion);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleVisibilityCheck);
      window.removeEventListener("resize", scheduleVisibilityCheck);
      preference.removeEventListener("change", finishWithoutMotion);
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(checkFrame);
    };
  }, []);

  return (
    <section className="trust-row" ref={sectionRef} aria-label={label}>
      {milestones.map(({ value, suffix = "", label }, index) => (
        <div className="trust-item" key={`${value}-${label}`}>
          <strong aria-hidden="true">
            {values[index]}{suffix}
          </strong>
          <span className="visually-hidden">
            {value}{suffix}
          </span>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
