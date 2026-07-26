import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { FiVolume2, FiVolumeX, FiMapPin, FiChevronDown } from "react-icons/fi";
import WeddingLanding from "./Wedding";

const App: React.FC = () => {



  return (
    <WeddingLanding />
  );
};

export default App;
