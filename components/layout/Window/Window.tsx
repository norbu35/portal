import React, {
  Dispatch,
  ForwardedRef,
  ReactElement,
  SetStateAction,
  forwardRef,
  useEffect,
  useState,
} from 'react';
import { Rnd } from 'react-rnd';

import TitleBar from '@/components/composite/TitleBar/TitleBar';
import SettingsLayout from '../Widgets/SettingsLayout';

import { useWindow } from './useWindow';
import { WidgetState, WidgetStates } from '../../layout/types';
import { WeatherSettingsType } from '@/components/widgets/Weather/WeatherSettings';
import { WindowState } from './types';
import styles from './Window.module.scss';
import settingsMap from './settingsMap';

interface Props {
  name: string;
  state: WidgetState;
  setState: Dispatch<SetStateAction<WidgetStates>>;
  windowRefs: HTMLDivElement[];
  children: ReactElement;
  isUnlocked?: boolean;
}

type SettingsType = WeatherSettingsType;

function Window(
  { name, state: globalState, setState: setGlobalState, windowRefs, isUnlocked, children }: Props,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const [widgetState, setWidgetState] = useState<WidgetState>(globalState);
  const [windowState, setWindowState] = useState<WindowState>(
    widgetState.window,
  );
  const [settingsState, setSettingsState] = useState<SettingsType>(
    widgetState.settings!,
  );
  const [isVisible, setIsVisible] = useState<boolean>(windowState.isVisible);
  const [settingsIsOpen, setSettingsIsOpen] = useState<boolean>(false);

  const { handleDrag, handleDragStop, handleResize, handleResizeStop } =
    useWindow(windowState, windowRefs, setWindowState);
  const title = name.charAt(0).toUpperCase() + name.slice(1);

  useEffect(() => {
    setGlobalState((prevState) => ({
      ...prevState,
      [name]: widgetState,
    }));
  }, [widgetState, name, setGlobalState]);

  useEffect(() => {
    setWidgetState((prevState) => ({
      ...prevState,
      window: windowState,
    }));
  }, [windowState]);

  useEffect(() => {
    setWidgetState((prevState) => ({
      ...prevState,
      settings: settingsState,
    }));
  }, [settingsState]);

  useEffect(() => {
    setWindowState((prevState) => ({
      ...prevState,
      isVisible: isVisible,
    }));
  }, [isVisible]);

  const SettingsComponent = settingsMap[name as keyof typeof settingsMap];

  return (
    <>
      <div className={styles.container} ref={ref}>
        <Rnd
          position={{
            x: windowState.position.x,
            y: windowState.position.y,
          }}
          size={{
            width: windowState.size.width,
            height: windowState.size.height,
          }}
          maxWidth={windowState.maxWidth}
          minWidth={windowState.minWidth}
          maxHeight={windowState.maxHeight}
          minHeight={windowState.minHeight}
          disableDragging={isUnlocked ? false : true}
          enableResizing={isUnlocked ? true : false}
          onDrag={handleDrag}
          onDragStop={handleDragStop}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
          bounds="section"
        >
          {isUnlocked && (
            <TitleBar
              setIsVisible={setIsVisible}
              setSettingsIsOpen={setSettingsIsOpen}
              settingsIsOpen={settingsIsOpen}
            >
              {title}
            </TitleBar>
          )}
          <div
            className={styles.children}
            style={{ borderRadius: isUnlocked ? '0 0 15px 15px' : '15px' }}
          >
            {children}
          </div>
        </Rnd>
      </div>
      {settingsIsOpen && (
        <SettingsLayout name={name} setIsVisible={setSettingsIsOpen}>
          <SettingsComponent
            settingsState={settingsState}
            setSettingsState={setSettingsState}
          />
        </SettingsLayout>
      )}
    </>
  );
}

export default forwardRef(Window);
