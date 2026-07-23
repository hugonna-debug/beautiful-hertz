export interface HeadItem {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  isOverride: boolean;
  relFolder: string;
}

export const HEADS_CATALOG: HeadItem[] = [
  // --- MALE HEADS ---
  {
    "id": "human_male",
    "name": "Human Male",
    "gender": "male",
    "isOverride": false,
    "relFolder": "male heads/human_male/idle"
  },
  {
    "id": "human_male_elderly",
    "name": "Human Male Elderly",
    "gender": "male",
    "isOverride": false,
    "relFolder": "male heads/human_male_elderly/idle"
  },
  {
    "id": "orc_male",
    "name": "Orc Male",
    "gender": "male",
    "isOverride": false,
    "relFolder": "male heads/orc_male/idle"
  },
  {
    "id": "lizard_male",
    "name": "Lizard Male (Mask)",
    "gender": "male",
    "isOverride": true,
    "relFolder": "male heads/(override hair, glasses, helmets, facial features)/lizard_male/idle"
  },
  {
    "id": "wolf_male",
    "name": "Wolf Male (Mask)",
    "gender": "male",
    "isOverride": true,
    "relFolder": "male heads/(override hair, glasses, helmets, facial features)/wolf_male/idle"
  },

  // --- FEMALE HEADS ---
  {
    "id": "human_female",
    "name": "Human Female",
    "gender": "female",
    "isOverride": false,
    "relFolder": "female heads/human_female/idle"
  },
  {
    "id": "human_female_elderly",
    "name": "Human Female Elderly",
    "gender": "female",
    "isOverride": false,
    "relFolder": "female heads/human_female_elderly/idle"
  },
  {
    "id": "orc_female",
    "name": "Orc Female",
    "gender": "female",
    "isOverride": false,
    "relFolder": "female heads/orc_female/idle"
  },
  {
    "id": "lizard_female",
    "name": "Lizard Female (Mask)",
    "gender": "female",
    "isOverride": true,
    "relFolder": "female heads/(override hair, glasses, helmets, facial features)/lizard_female/idle"
  },
  {
    "id": "wolf_female",
    "name": "Wolf Female (Mask)",
    "gender": "female",
    "isOverride": true,
    "relFolder": "female heads/(override hair, glasses, helmets, facial features)/wolf_female/idle"
  },

  // --- UNISEX HEADS ---
  {
    "id": "alien",
    "name": "Alien",
    "gender": "unisex",
    "isOverride": false,
    "relFolder": "unisex/alien"
  },
  {
    "id": "goblin",
    "name": "Goblin",
    "gender": "unisex",
    "isOverride": false,
    "relFolder": "unisex/goblin"
  },
  {
    "id": "human_zombie",
    "name": "Human Zombie",
    "gender": "unisex",
    "isOverride": false,
    "relFolder": "unisex/human_zombie/idle"
  },
  {
    "id": "sheep",
    "name": "Sheep",
    "gender": "unisex",
    "isOverride": false,
    "relFolder": "unisex/sheep"
  },
  {
    "id": "skeleton",
    "name": "Skeleton",
    "gender": "unisex",
    "isOverride": false,
    "relFolder": "unisex/skeleton"
  },
  {
    "id": "vampire",
    "name": "Vampire",
    "gender": "unisex",
    "isOverride": false,
    "relFolder": "unisex/vampire"
  },
  {
    "id": "zombie",
    "name": "Zombie",
    "gender": "unisex",
    "isOverride": false,
    "relFolder": "unisex/zombie"
  },
  {
    "id": "jack_no_palette",
    "name": "Jack Pumpkin (Mask)",
    "gender": "unisex",
    "isOverride": true,
    "relFolder": "unisex/(override hair, glasses, helmets, facial features)"
  },
  {
    "id": "boarman",
    "name": "Boarman (Mask)",
    "gender": "unisex",
    "isOverride": true,
    "relFolder": "unisex/(override hair, glasses, helmets, facial features)/boarman/idle"
  },
  {
    "id": "frankenstein",
    "name": "Frankenstein (Mask)",
    "gender": "unisex",
    "isOverride": true,
    "relFolder": "unisex/(override hair, glasses, helmets, facial features)/frankenstein"
  },
  {
    "id": "minotaur",
    "name": "Minotaur (Mask)",
    "gender": "unisex",
    "isOverride": true,
    "relFolder": "unisex/(override hair, glasses, helmets, facial features)/minotaur/idle"
  },
  {
    "id": "pig",
    "name": "Pig (Mask)",
    "gender": "unisex",
    "isOverride": true,
    "relFolder": "unisex/(override hair, glasses, helmets, facial features)/pig"
  },
  {
    "id": "rabbit",
    "name": "Rabbit (Mask)",
    "gender": "unisex",
    "isOverride": true,
    "relFolder": "unisex/(override hair, glasses, helmets, facial features)/rabbit"
  }
];

export function getCompatibleHeads(bodyType: string): HeadItem[] {
  const isFemaleBody = bodyType === 'female';
  return HEADS_CATALOG.filter(h => {
    if (isFemaleBody) {
      return h.gender === 'female' || h.gender === 'unisex';
    } else {
      return h.gender === 'male' || h.gender === 'unisex';
    }
  });
}

export function isHeadCompatibleWithBody(headId: string, bodyType: string): boolean {
  const head = HEADS_CATALOG.find(h => h.id === headId);
  if (!head) return true;
  if (bodyType === 'female') {
    return head.gender === 'female' || head.gender === 'unisex';
  } else {
    return head.gender === 'male' || head.gender === 'unisex';
  }
}

export function getHeadFileUrl(headId: string, skinTone: string, action?: string): { primaryUrl: string; fallbackUrl: string } {
  const head = HEADS_CATALOG.find(h => h.id === headId);
  const tone = skinTone || 'light';
  
  if (!head) {
    const isAnim = action && (action === 'walk' || action === 'slash' || action === 'spellcast');
    const folderName = isAnim ? 'run' : 'idle';
    return {
      primaryUrl: `/assets/character_creator/heads/male heads/human_male/${folderName}/${tone}.png`,
      fallbackUrl: `/assets/character_creator/heads/male heads/human_male/${folderName}/light.png`
    };
  }

  let folder = head.relFolder;
  if (action && (action === 'walk' || action === 'slash' || action === 'spellcast')) {
    folder = folder.replace(/\/idle$/, '/run');
  }

  if (head.id === 'jack_no_palette') {
    return {
      primaryUrl: `/assets/character_creator/heads/${folder}/jack no palette.png`,
      fallbackUrl: `/assets/character_creator/heads/${folder}/mouse.png`
    };
  }

  if (head.id === 'skeleton' || head.id === 'zombie') {
    return {
      primaryUrl: `/assets/character_creator/heads/${folder}/idle.png`,
      fallbackUrl: `/assets/character_creator/heads/${folder}/${head.id}.png`
    };
  }

  return {
    primaryUrl: `/assets/character_creator/heads/${folder}/${tone}.png`,
    fallbackUrl: `/assets/character_creator/heads/${folder}/light.png`
  };
}
