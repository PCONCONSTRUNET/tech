'use client';

import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="html body">
        <div className="legos">
          <div className="blue lego" />
          <div className="red lego" />
          <div className="yellow lego" />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  .html,
  .body {
    height: 100%;
    width: 100%;
    margin: 0;
  }

  .legos {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    transform: scale(0.6);
  }

  .lego {
    position: absolute;
    height: 155px;
    width: 268px;
    transform: rotate(-23deg);
    background-size:
      72% 46%,
      100% 45%,
      92% 56%;
    background-position:
      70px 0px,
      0 0,
      18px 100%;
    background-repeat: no-repeat;
  }

  .lego:before {
    content: "";
    position: absolute;
    border-radius: 40%;
    height: 18px;
    width: 37px;
    left: 26px;
    top: -9px;
    transform: rotate(23deg);
  }

  .lego:after {
    content: "";
    position: absolute;
    height: 82px;
    width: 88px;
    transform: rotate(51deg) skew(28deg);
    left: -35px;
    top: 37px;
  }

  .blue {
    top: calc(50% - 15px);
    left: calc(50% - 140px);
    z-index: 1;
    animation: blue-move 10s infinite linear;
    background-image: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 95%,
        rgba(110, 187, 255, 0.4) 98%,
        rgba(255, 255, 255, 0) 100%
      ),
      linear-gradient(52deg, #1e88e5 82%, rgba(255, 255, 255, 0) 82%),
      linear-gradient(113deg, #1e88e5 87%, rgba(0, 0, 0, 0) 86%);
  }

  .blue:before {
    background: #2093f7;
    box-shadow:
      0px 10px 0px #1d6bb2,
      0px 5px 0px #1d6bb2,
      50px -20px 0px #2093f7,
      50px -10px 0px #1d6bb2,
      50px -15px 0px #1d6bb2,
      100px -40px 0px #2093f7,
      100px -30px 0px #1d6bb2,
      100px -35px 0px #1d6bb2,
      150px -60px 0px #2093f7,
      150px -50px 0px #1d6bb2,
      150px -55px 0px #1d6bb2,
      40px 20px 0px #2093f7,
      40px 25px 0px #1d6bb2,
      40px 30px 0px #1d6bb2,
      90px 0px 0px #2093f7,
      90px 5px 0px #1d6bb2,
      90px 10px 0px #1d6bb2,
      140px -20px 0px #2093f7,
      140px -15px 0px #1d6bb2,
      140px -10px 0px #1d6bb2,
      190px -40px 0px #2093f7,
      190px -35px 0px #1d6bb2,
      190px -30px 0px #1d6bb2;
  }

  .blue:after {
    background: #1d6bb2;
  }

  @keyframes blue-move {
    0% {
      top: calc(50% - 15px);
      left: calc(50% - 140px);
      z-index: 1;
    }
    3.334% {
      top: calc(50% + 100px);
    }
    6.668% {
      left: calc(50% + 180px);
    }
    10% {
      left: calc(50% + 180px);
      top: calc(50% - 290px);
    }
    13.336% {
      top: calc(50% - 290px);
      left: calc(50% - 78px);
      z-index: 3;
    }
    16.67% {
      top: calc(50% - 202px);
      left: calc(50% - 78px);
      z-index: 3;
    }
    33.337% {
      top: calc(50% - 134px);
      left: calc(50% - 78px);
      z-index: 2;
    }
    50% {
      top: calc(50% - 15px);
      left: calc(50% - 78px);
      z-index: 1;
    }
    53.334% {
      top: calc(50% + 100px);
    }
    56.668% {
      left: calc(50% - 400px);
    }
    60% {
      left: calc(50% - 200px);
      top: calc(50% - 290px);
    }
    63.336% {
      top: calc(50% - 290px);
      left: calc(50% - 140px);
      z-index: 3;
    }
    66.68% {
      top: calc(50% - 202px);
      left: calc(50% - 140px);
      z-index: 3;
    }
    83.35% {
      top: calc(50% - 83px);
      left: calc(50% - 137px);
      z-index: 2;
    }
  }

  .red {
    top: calc(50% - 134px);
    left: calc(50% - 78px);
    z-index: 2;
    animation: red-move 10s infinite linear;
    background-image: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 95%,
        rgba(248, 135, 127, 0.4) 98%,
        rgba(255, 255, 255, 0) 100%
      ),
      linear-gradient(52deg, #f44336 82%, rgba(0, 0, 0, 0) 82%),
      linear-gradient(113deg, #f44336 87%, rgba(0, 0, 0, 0) 86%);
  }

  .red:before {
    background: #f36359;
    box-shadow:
      0px 10px 0px #db3327,
      0px 5px 0px #db3327,
      50px -20px 0px #f36359,
      50px -10px 0px #db3327,
      50px -15px 0px #db3327,
      100px -40px 0px #f36359,
      100px -30px 0px #db3327,
      100px -35px 0px #db3327,
      150px -60px 0px #f36359,
      150px -50px 0px #db3327,
      150px -55px 0px #db3327,
      40px 20px 0px #f36359,
      40px 25px 0px #db3327,
      40px 30px 0px #db3327,
      90px 0px 0px #f36359,
      90px 5px 0px #db3327,
      90px 10px 0px #db3327,
      140px -20px 0px #f36359,
      140px -15px 0px #db3327,
      140px -10px 0px #db3327,
      190px -40px 0px #f36359,
      190px -35px 0px #db3327,
      190px -30px 0px #db3327;
  }

  .red:after {
    background: #db3327;
  }

  @keyframes red-move {
    0% {
      top: calc(50% - 134px);
      left: calc(50% - 78px);
      z-index: 2;
    }
    16.67% {
      top: calc(50% - 15px);
      left: calc(50% - 78px);
      z-index: 1;
    }
    20% {
      top: calc(50% + 100px);
    }
    23.338% {
      left: calc(50% - 400px);
    }
    26.672% {
      left: calc(50% - 200px);
      top: calc(50% - 290px);
    }
    30% {
      top: calc(50% - 290px);
      left: calc(50% - 140px);
      z-index: 3;
    }
    33.337% {
      top: calc(50% - 202px);
      left: calc(50% - 140px);
      z-index: 3;
    }
    50% {
      top: calc(50% - 83px);
      left: calc(50% - 137px);
      z-index: 2;
    }
    66.68% {
      top: calc(50% - 15px);
      left: calc(50% - 140px);
      z-index: 1;
    }
    70.014% {
      top: calc(50% + 100px);
    }
    73.348% {
      left: calc(50% + 168px);
    }
    76.68% {
      left: calc(50% + 168px);
      top: calc(50% - 290px);
    }
    80.016% {
      top: calc(50% - 290px);
      left: calc(50% - 78px);
      z-index: 3;
    }
    83.35% {
      top: calc(50% - 202px);
      left: calc(50% - 78px);
      z-index: 3;
    }
  }

  .yellow {
    top: calc(50% - 202px);
    left: calc(50% - 140px);
    z-index: 3;
    animation: yellow-move 10s infinite linear;
    background-image: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 95%,
        #ffe884 98%,
        #ffe884 98%,
        rgba(255, 255, 255, 0) 100%
      ),
      linear-gradient(52deg, #fdd835 82%, rgba(0, 0, 0, 0) 82%),
      linear-gradient(113deg, #fdd835 87%, rgba(0, 0, 0, 0) 86%);
  }

  .yellow:before {
    background: #ffe884;
    box-shadow:
      0px 10px 0px #e9c72f,
      0px 5px 0px #e9c72f,
      50px -20px 0px #ffe884,
      50px -10px 0px #e9c72f,
      50px -15px 0px #e9c72f,
      100px -40px 0px #ffe884,
      100px -30px 0px #e9c72f,
      100px -35px 0px #e9c72f,
      150px -60px 0px #ffe884,
      150px -50px 0px #e9c72f,
      150px -55px 0px #e9c72f,
      40px 20px 0px #ffe884,
      40px 25px 0px #e9c72f,
      40px 30px 0px #e9c72f,
      90px 0px 0px #ffe884,
      90px 5px 0px #e9c72f,
      90px 10px 0px #e9c72f,
      140px -20px 0px #ffe884,
      140px -15px 0px #e9c72f,
      140px -10px 0px #e9c72f,
      190px -40px 0px #ffe884,
      190px -35px 0px #e9c72f,
      190px -30px 0px #e9c72f;
  }

  .yellow:after {
    background: #e9c72f;
  }

  @keyframes yellow-move {
    0% {
      top: calc(50% - 202px);
      left: calc(50% - 140px);
      z-index: 3;
    }
    16.67% {
      top: calc(50% - 83px);
      left: calc(50% - 137px);
      z-index: 2;
    }
    33.337% {
      top: calc(50% - 15px);
      left: calc(50% - 140px);
      z-index: 1;
    }
    36.671% {
      top: calc(50% + 100px);
    }
    40% {
      left: calc(50% + 168px);
    }
    43.339% {
      left: calc(50% + 168px);
      top: calc(50% - 290px);
    }
    46.673% {
      top: calc(50% - 290px);
      left: calc(50% - 78px);
      z-index: 3;
    }
    50% {
      top: calc(50% - 202px);
      left: calc(50% - 78px);
      z-index: 3;
    }
    66.68% {
      top: calc(50% - 134px);
      left: calc(50% - 78px);
      z-index: 2;
    }
    83.35% {
      top: calc(50% - 15px);
      left: calc(50% - 78px);
      z-index: 1;
    }
    86.684% {
      top: calc(50% + 100px);
    }
    90.018% {
      left: calc(50% - 400px);
    }
    93.352% {
      left: calc(50% - 200px);
      top: calc(50% - 290px);
      z-index: 1;
    }
    96.686% {
      top: calc(50% - 290px);
      left: calc(50% - 140px);
      z-index: 3;
    }
  }`;

export default Loader;
