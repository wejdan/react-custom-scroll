import React, { useRef, useEffect, useState, useImperativeHandle } from "react";
import styled from "styled-components";

const ScrollContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden; /* Hide default scrollbar */
  padding-right: 30px; /* Add padding to make room for buttons */
`;

const ScrollContent = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

const Thumb = styled.div`
  position: absolute;
  width: 12px;
  background: #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  display: ${(props) =>
    props.hidden ? "none" : "block"}; /* Hide thumb if hidden */
  &:hover {
    background: #0056b3;
  }
`;
const Track = styled.div`
  position: absolute;
  right: 10px;
  top: 0px; /* Leave space for the top button */
  bottom: 0px; /* Leave space for the bottom button */
  width: 12px;
  background: #333; /* Light background for the track */
  display: flex;
  justify-content: center;
`;
const ScrollButton = styled.div`
  position: absolute;
  right: 10px;
  width: 12px;
  height: 20px;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  z-index: 1; /* Ensure buttons are above other elements */
  opacity: ${(props) =>
    props.disabled ? 0.5 : 1}; /* Dim the button if disabled */
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
  border-radius: 50%;
  transition: background 0.3s ease, color 0.3s ease;
  &:hover {
    color: #0056b3;
  }
`;

const TopButton = styled(ScrollButton)`
  top: 0;
`;

const BottomButton = styled(ScrollButton)`
  bottom: 0;
`;

const disableTextSelection = () => {
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none"; /* For Safari */
  document.body.style.msUserSelect = "none"; /* For IE */
  document.body.style.mozUserSelect = "none"; /* For Firefox */
};

const enableTextSelection = () => {
  document.body.style.userSelect = "";
  document.body.style.webkitUserSelect = ""; /* For Safari */
  document.body.style.msUserSelect = ""; /* For IE */
  document.body.style.mozUserSelect = ""; /* For Firefox */
};

const CustomScroll = React.forwardRef(
  ({ children, onScroll, style, contentStyle }, ref) => {
    const contentRef = useRef(null);
    const containerRef = useRef(null);
    const scrolled = useRef(null);

    const thumbRef = useRef(null);
    const [thumbHeight, setThumbHeight] = useState(0);
    const [thumbTop, setThumbTop] = useState(0);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const isDraggingRef = useRef(false);
    const clickTimeoutRef = useRef(null);

    const scrollAnimationRef = useRef(null);

    const updateThumb = () => {
      const computedStyle = getComputedStyle(containerRef.current);
      const paddingTop = parseInt(computedStyle.paddingTop, 10);
      const paddingBottom = parseInt(computedStyle.paddingBottom, 10);

      const buttonHeight = 20; // Height of the up and down buttons
      const combinedButtonHeight = buttonHeight * 2; // Total height of both buttons

      const contentHeight = contentRef.current.scrollHeight; // Use the full scrollHeight of the content
      const visibleHeight = contentRef.current.clientHeight; // clientHeight already includes the padding of the content

      // Calculate the scroll ratio using the actual visible height
      const scrollRatio = visibleHeight / contentHeight;

      // Calculate the thumb height based on the visible height and scroll ratio
      const newThumbHeight = Math.max(visibleHeight * scrollRatio, 30); // Ensure minimum thumb height

      const adjustedVisibleHeight = visibleHeight - combinedButtonHeight;

      // Calculate the thumb top position ensuring it stays within bounds and does not overlap with the buttons
      const scrollPositionRatio =
        contentRef.current.scrollTop / (contentHeight - visibleHeight);
      const newThumbTop =
        Math.min(
          Math.max(
            scrollPositionRatio * (adjustedVisibleHeight - newThumbHeight),
            0
          ),
          adjustedVisibleHeight - newThumbHeight
        ) + buttonHeight;
      setThumbHeight(newThumbHeight);
      setThumbTop(newThumbTop);
      if (onScroll) {
        onScroll(contentRef.current.scrollTop);
      }

      // Check if content is overflowing
      const isOverflowing = contentRef.current.scrollHeight > visibleHeight;
      setIsOverflowing(isOverflowing);
    };

    useEffect(() => {
      if (scrolled.current) return;
      updateThumb();
    }, []);

    const handleSmoothScroll = (targetPosition, duration = 800) => {
      const content = contentRef.current;
      const startPosition = content.scrollTop;
      const distance = targetPosition - startPosition;
      let startTime = null;

      const animation = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        content.scrollTop = run;
        if (timeElapsed < duration) requestAnimationFrame(animation);
      };

      const ease = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      };

      requestAnimationFrame(animation);
    };

    useImperativeHandle(ref, () => ({
      scrollToTop: () => {
        contentRef.current.scrollTop = 0;
      },
      scrollToBottom: () => {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      },
      scrollTo: (position) => {
        scrolled.current = true;
        contentRef.current.scrollTop = position;
      },
      smoothScroll: (position) => {
        handleSmoothScroll(position);
      },
      getScrollProps: () => {
        return {
          scrollHeight: contentRef.current.scrollHeight - 0,
          scrollTop: contentRef.current.scrollTop,
          clientHeight: contentRef.current.clientHeight,
        };
      },
    }));

    const handleThumbDrag = (event) => {
      const content = contentRef.current;
      const startY = event.clientY; // the initial vertical position (in pixels) of the mouse when the thumb is first clicked and held down
      const startScrollTop = content.scrollTop; // the vertical scroll position of the scrollable content
      disableTextSelection(); // Disable text selection when dragging starts
      const scrollSpeed = 0.3; // Adjust the scroll speed factor as needed
      isDraggingRef.current = true;
      const onMouseMove = (event) => {
        const deltaY = event.clientY - startY; // represents the vertical distance the thumb moved during a drag operation

        const x = (deltaY / thumbHeight) * content.clientHeight;
        content.scrollTop = startScrollTop + x * scrollSpeed;
      };

      const onMouseUp = () => {
        enableTextSelection(); // Enable text selection when dragging ends
        // Prevent click event after dragging
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
        clickTimeoutRef.current = setTimeout(() => {
          clickTimeoutRef.current = null;
          isDraggingRef.current = false;
        }, 100);

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const handleScrollUp = () => {
      const content = contentRef.current;
      handleSmoothScroll(content.scrollTop - 70); // Adjust the scroll amount as needed
    };

    const handleScrollDown = () => {
      const content = contentRef.current;
      handleSmoothScroll(content.scrollTop + 70); // Adjust the scroll amount as needed
    };

    const startContinuousScroll = (direction) => {
      const scrollStep = () => {
        const content = contentRef.current;
        const scrollAmount = 5; // Adjust the scroll amount as needed
        if (direction === -1) {
          content.scrollTop = Math.max(content.scrollTop - scrollAmount, 0);
        } else {
          content.scrollTop = Math.min(
            content.scrollTop + scrollAmount,
            content.scrollHeight - content.clientHeight
          );
        }
        //   updateThumb();
        scrollAnimationRef.current = requestAnimationFrame(scrollStep);
      };

      scrollAnimationRef.current = requestAnimationFrame(scrollStep);
    };

    const stopContinuousScroll = () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
        scrollAnimationRef.current = null;
      }
    };

    const handleTrackClick = (event) => {
      if (isDraggingRef.current) return;
      const track = event.currentTarget;
      const clickY = event.clientY - track.getBoundingClientRect().top;
      const scrollAmount = (clickY - thumbTop - thumbHeight / 2) * 1; // Adjust the factor to control the scroll speed
      handleSmoothScroll(contentRef.current.scrollTop + scrollAmount, 500);
    };

    return (
      <ScrollContainer ref={containerRef} style={style}>
        <TopButton
          onMouseDown={() => startContinuousScroll(-1)}
          onMouseUp={stopContinuousScroll}
          onMouseLeave={stopContinuousScroll}
          disabled={!isOverflowing}
        >
          ⮝
        </TopButton>
        <ScrollContent
          style={contentStyle}
          onScroll={updateThumb}
          ref={contentRef}
        >
          {children}
        </ScrollContent>
        <Track onClick={handleTrackClick}>
          <Thumb
            ref={thumbRef}
            style={{ height: thumbHeight, top: thumbTop }}
            onMouseDown={handleThumbDrag}
            hidden={!isOverflowing}
          />
        </Track>
        <BottomButton
          onMouseDown={() => startContinuousScroll(1)}
          onMouseUp={stopContinuousScroll}
          onMouseLeave={stopContinuousScroll}
          disabled={!isOverflowing}
        >
          ⮟
        </BottomButton>
      </ScrollContainer>
    );
  }
);

export default CustomScroll;
