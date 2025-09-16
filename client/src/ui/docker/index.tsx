import React, { useRef, useEffect } from 'react';
import { DragMove } from '@douyinfe/semi-ui';

import styled from 'styled-components';


const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: #BF4F74;
`;

const DockerCtx = styled.div`
  width: 380px;
  height: 60px;
  position: fixed;
  bottom: 40px;
  left: 50%;
  background-color: rgba(0, 0, 0, .6);
  transform: translateX(-50%);
  border-radius: 14px;
  padding: 10px;
`

const Docker = ({ children }: { children: React.ReactNode }) => {
  return (
      <>
            <DragMove>
            <DockerCtx>
                  {children}
            </DockerCtx>
            </DragMove>
      </>
  );
}

export default Docker;