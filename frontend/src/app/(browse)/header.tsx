'use client';

import { DesktopHeader } from './_components/desktop-header';
import { MobileHeader } from './_components/mobile-header';

const Header = () => {
  return (
    <>
      <DesktopHeader />

      <MobileHeader />
    </>
  );
};

export { Header };
