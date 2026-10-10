<template>
  <svg
    class="city-map"
    viewBox="0 0 800 430"
    aria-label="Illustrated race route through Žilina from UNIZA Campus to SSE Headquarters"
    role="img"
  >
    <defs>
      <pattern
        id="map-grid"
        width="32"
        height="32"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M32 0H0v32"
          fill="none"
          stroke="#dbe0cc"
          stroke-width=".5"
          opacity=".45"
        />
      </pattern>
      <pattern
        id="river-lines"
        width="48"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M4 10h18m12 0h8"
          stroke="#a7c9c1"
          stroke-width="2"
          stroke-linecap="round"
        />
      </pattern>
      <g id="tree">
        <ellipse cy="12" rx="10" ry="4" fill="#637a55" opacity=".14" />
        <path d="M0 0v12" stroke="#5b6246" stroke-width="2" />
        <path
          d="M0-23C-13-23-14-10-9-7-19 4-7 8 0 5c10 5 18-3 10-12C15-16 8-24 0-23Z"
          fill="#a7ba7a"
          stroke="#6e8557"
          stroke-width="1.1"
        />
        <path
          d="M0-14v15m0-9 5-4m-5 11-5-5"
          fill="none"
          stroke="#839b61"
          stroke-width="1"
        />
      </g>
      <g id="round-tree">
        <ellipse cy="12" rx="9" ry="3" fill="#637a55" opacity=".14" />
        <path d="M0-5v17" stroke="#66694c" stroke-width="2" />
        <circle
          cy="-10"
          r="12"
          fill="#c2cb8b"
          stroke="#869868"
          stroke-width="1.1"
        />
        <path d="m0-19 1 20m0-11-6-5" fill="none" stroke="#9cab72" />
      </g>
      <g id="house">
        <path d="m0 0 23-13 30 14-23 14Z" fill="#d3a58b" stroke="#8f8e74" />
        <path d="M0 0v28l30 14V15Z" fill="#f7e3bc" stroke="#a89d7f" />
        <path d="m30 15 23-14v29L30 42Z" fill="#dccba5" stroke="#a89d7f" />
        <path d="m7 10 7 3v8l-7-3Zm13 6 6 3v8l-6-3Z" fill="#8eaaa0" />
        <path d="m35 19 6-3v9l-6 3m10-15 5-3v9l-5 3" fill="#a8b9a4" />
      </g>
      <g id="building">
        <path d="m0 0 39-21 56 25-40 22Z" fill="#c6b6a6" stroke="#8f9281" />
        <path d="M0 0v49l55 25V26Z" fill="#f6e8cc" stroke="#a09d86" />
        <path d="m55 26 40-22v49L55 74Z" fill="#d8ceb2" stroke="#a09d86" />
        <g fill="#92aca5">
          <path
            d="m8 15 7 3v9l-7-3Zm17 8 7 3v9l-7-3Zm17 8 7 3v9l-7-3Zm-34 1 7 3v9l-7-3Zm17 8 7 3v9l-7-3Zm17 8 7 3v9l-7-3Z"
          />
          <path
            d="m62 32 8-4v9l-8 4m15-17 8-4v9l-8 4m-23 16 8-4v9l-8 4m15-17 8-4v9l-8 4"
          />
        </g>
      </g>
    </defs>
    <rect width="800" height="430" fill="#eaf0dd" />
    <rect width="800" height="430" fill="url(#map-grid)" />
    <!-- Parks, neighbourhood blocks, and a schematic river (not a navigation map). -->
    <path
      d="M0 39Q63 1 145 52t141-3q44-23 65 17t-24 88q-84 54-173 3T0 169Z"
      fill="#dce8c9"
    />
    <path d="M0 339q66-46 146 26t184 39l30 26H0Z" fill="#d9e4c9" />
    <path
      d="M554 430q-30-67 64-86t85-62q-16-51 97-54v65q-60-13-57 29t-77 64-45 44Z"
      fill="#bed9d0"
    />
    <path
      d="M554 430q-30-67 64-86t85-62q-16-51 97-54v65q-60-13-57 29t-77 64-45 44Z"
      fill="url(#river-lines)"
    />
    <g fill="none" stroke="#d4d7c3" stroke-width="19">
      <path d="M-20 215 210 76 469 130 690 29 820 90" />
      <path d="m122-20 64 105 140 78 166-10 64-55" />
      <path d="M-10 283 145 188 336 204 456 99 567-20" />
      <path d="m315 430 55-81 118-34 104-71 132-8 93-60" />
      <path d="m381-10 8 116m-46 56-47 107m294-8 93 72" />
    </g>
    <g fill="none" stroke="#faf8ed" stroke-width="12">
      <path d="M-20 215 210 76 469 130 690 29 820 90" />
      <path d="m122-20 64 105 140 78 166-10 64-55" />
      <path d="M-10 283 145 188 336 204 456 99 567-20" />
      <path d="m315 430 55-81 118-34 104-71 132-8 93-60" />
      <path d="m381-10 8 116m-46 56-47 107m294-8 93 72" />
    </g>
    <path d="m659 321 27-15 13 19-29 17Z" fill="#e6d0ad" stroke="#afad8c" />
    <path d="m660 326 29-16m-26 21 29-16" stroke="#b8aa8a" />
    <g opacity=".9">
      <use href="#house" x="54" y="174" />
      <use href="#house" x="106" y="145" />
      <use href="#house" x="161" y="119" />
      <use href="#house" x="226" y="118" />
      <use href="#house" x="306" y="66" />
      <use href="#house" x="425" y="172" />
      <use href="#house" x="470" y="341" />
      <use href="#house" x="529" y="292" />
      <use href="#house" x="752" y="143" />
      <use href="#house" x="708" y="40" />
      <use href="#house" x="383" y="36" />
    </g>
    <use
      href="#building"
      x="221"
      y="157"
      transform="translate(35,12) scale(.84)"
    />
    <use
      href="#building"
      x="393"
      y="218"
      transform="translate(80,25) scale(.75)"
    />
    <!-- UNIZA campus -->
    <g transform="translate(44 252)">
      <path d="m0 8 44-22 71 29-43 22Z" fill="#c1bca3" stroke="#888c77" />
      <path d="M0 8v38l72 29V37Z" fill="#f6edcf" stroke="#929783" />
      <path d="m72 37 43-22v38L72 75Z" fill="#d0d2b8" stroke="#929783" />
      <path
        d="m11 25 11 4v10l-11-4m20-2 11 4v10l-11-4m20-2 11 4v10l-11-4m26-3 11-6v11l-11 6m20-22 10-5v11l-10 5"
        fill="#7eaaa6"
      />
      <path d="m29 55 15 6V45l-15-6Z" fill="#819989" />
      <path d="m9 9 33-16 48 19-32 16Z" fill="#e1dbc1" />
      <text
        x="14"
        y="22"
        font-size="10"
        font-weight="800"
        fill="#526b53"
        transform="rotate(22 14 22)"
      >
        UNIZA
      </text>
      <path d="M5 47V26m0 0 12 5v10L5 36" fill="#cbda88" stroke="#788b52" />
    </g>
    <!-- Town square and fountain -->
    <path d="m477 145 45-21 61 29-45 28Z" fill="#e1d8bd" stroke="#c4bea3" />
    <g stroke="#c4bea3" stroke-width=".7">
      <path
        d="m490 147 45-21m-28 29 45-21m-27 29 45-21m-70-6 59 29m-47-35 59 29"
      />
    </g>
    <ellipse cx="530" cy="149" rx="15" ry="8" fill="#c0ccba" stroke="#8da594" />
    <ellipse cx="530" cy="147" rx="11" ry="5" fill="#a5c5bc" />
    <path
      d="M530 145v-16m-5 10q5-13 10 0"
      stroke="#89b3ac"
      fill="none"
      stroke-width="2"
    />
    <!-- Church overlooking Mariánske námestie -->
    <g transform="translate(559 78)">
      <path d="m0 23 24-12 34 15-23 14Z" fill="#bf977e" stroke="#938b73" />
      <path d="M0 23v36l35 15V40Z" fill="#f2e0b8" stroke="#a69c7a" />
      <path d="m35 40 23-14v35L35 74Z" fill="#d4c49f" stroke="#a69c7a" />
      <path d="M7 32V-1l9-6 10 4v42" fill="#f3e2bc" stroke="#a69c7a" />
      <path d="m7-1 9-25L26-3l-10 5Z" fill="#8a9a8b" stroke="#687c70" />
      <path d="M16-25v-8m-4 3h8" stroke="#687c70" />
      <ellipse cx="16" cy="15" rx="4" ry="5" fill="#faf8e6" stroke="#a69c7a" />
      <path d="M12 48v15l8 3V51q-4-7-8-3Z" fill="#8c9a82" />
    </g>
    <!-- SSE destination -->
    <g transform="translate(655 47)">
      <path d="m0 0 40-19 62 23-41 23Z" fill="#d2dccb" stroke="#7d9180" />
      <path d="M0 0v48l61 26V27Z" fill="#f9f7e8" stroke="#7d9180" />
      <path d="m61 27 41-23v48L61 74Z" fill="#b1c9bd" stroke="#7d9180" />
      <path d="m8 20 44 18v14L8 34Z" fill="#a3c6bd" />
      <path d="m69 32 26-15v25L69 57Z" fill="#83aaa1" />
      <path d="m16 22 1 14m12-9v14m13-8v13m37-21v26m8-31v26" stroke="#dce4ce" />
      <path d="m9 6 0 11 39 16V21Z" fill="#f6ce5d" />
      <text
        x="17"
        y="17"
        transform="rotate(22 17 17)"
        font-size="13"
        font-weight="900"
        fill="#374a3a"
      >
        SSE
      </text>
      <path d="m39 61 12 5V50l-12-5Z" fill="#557d70" />
    </g>
    <g>
      <use href="#tree" x="37" y="81" />
      <use href="#round-tree" x="72" y="60" />
      <use href="#tree" x="91" y="90" />
      <use href="#tree" x="133" y="51" />
      <use href="#round-tree" x="177" y="58" />
      <use href="#tree" x="202" y="26" />
      <use href="#tree" x="29" y="116" />
      <use href="#tree" x="55" y="125" />
      <use href="#round-tree" x="358" y="111" />
      <use href="#tree" x="424" y="92" />
      <use href="#tree" x="465" y="38" />
      <use href="#round-tree" x="521" y="65" />
      <use href="#tree" x="617" y="67" />
      <use href="#tree" x="769" y="80" />
      <use href="#round-tree" x="743" y="104" />
      <use href="#tree" x="711" y="207" />
      <use href="#tree" x="755" y="207" />
      <use href="#tree" x="604" y="300" />
      <use href="#round-tree" x="572" y="331" />
      <use href="#tree" x="769" y="347" />
      <use href="#tree" x="729" y="377" />
      <use href="#round-tree" x="685" y="410" />
      <use href="#tree" x="39" y="365" />
      <use href="#tree" x="69" y="394" />
      <use href="#round-tree" x="105" y="377" />
      <use href="#tree" x="155" y="408" />
      <use href="#tree" x="212" y="365" />
      <use href="#round-tree" x="244" y="392" />
      <use href="#tree" x="315" y="349" />
      <use href="#round-tree" x="450" y="394" />
      <use href="#tree" x="407" y="376" />
    </g>
    <!-- The survival route -->
    <path
      d="M116 330C126 281 212 281 230 253S257 234 268 234C328 234 315 312 360 312H412C464 312 447 231 488 226S516 190 538 190C588 190 604 216 633 171S665 113 690 111"
      fill="none"
      stroke="#fcfaf0"
      stroke-width="16"
      stroke-linecap="round"
    />
    <path
      d="M116 330C126 281 212 281 230 253S257 234 268 234C328 234 315 312 360 312H412C464 312 447 231 488 226S516 190 538 190C588 190 604 216 633 171S665 113 690 111"
      fill="none"
      stroke="#8a9d72"
      stroke-width="3"
      stroke-dasharray="6 8"
      stroke-linecap="round"
    />
    <g fill="#fcfaf0" stroke="#708764" stroke-width="2">
      <circle cx="116" cy="330" r="10" />
      <circle cx="268" cy="234" r="10" />
      <circle cx="412" cy="312" r="10" />
      <circle cx="538" cy="190" r="10" />
      <circle cx="690" cy="111" r="12" fill="#e9c65b" />
    </g>
    <g fill="#516149" font-size="9" text-anchor="middle" font-weight="800">
      <text x="116" y="334">1</text>
      <text x="268" y="238">2</text>
      <text x="412" y="316">3</text>
      <text x="538" y="194">4</text>
      <text x="690" y="115">5</text>
    </g>
    <g fill="#58664e" font-size="10" font-weight="700" text-anchor="middle">
      <text x="106" y="359">UNIZA CAMPUS</text>
      <text x="270" y="268">HLINY / VEĽKÝ DIEL</text>
      <text x="405" y="343">BULVÁR</text>
      <text x="548" y="235">MARIÁNSKE NÁMESTIE</text>
      <text x="698" y="148">SSE HEADQUARTERS</text>
    </g>
    <text
      x="696"
      y="361"
      fill="#7da69b"
      font-size="10"
      letter-spacing="3"
      transform="rotate(-31 696 361)"
    >
      RAJČIANKA
    </text>
    <g
      transform="translate(751 382)"
      fill="none"
      stroke="#84927a"
      stroke-width="1.3"
    >
      <path d="M0-17 5 5 0 0-5 5Z" fill="#84927a" />
      <path d="M0 0v14" />
      <text
        x="0"
        y="-22"
        text-anchor="middle"
        fill="#84927a"
        stroke="none"
        font-size="9"
      >
        N
      </text>
    </g>
  </svg>
</template>
