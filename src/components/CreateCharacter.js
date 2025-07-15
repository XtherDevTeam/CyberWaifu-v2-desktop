import React from 'react';
import { useNavigate } from 'react-router-dom';

import Message from '../components/Message';
import icons from '../shared/icons';
import Mui from '../shared/mui';
import * as Remote from '../shared/remote';
import ContentEditDialog from './ContentEditDialog';
import StickerSetSelector from './StickerSetSelector';
import TTSModelSelector from './TTSModelSelector';
import THA4ServiceSelector from './THA4ServiceSelector';


function CreateCharacter() {
  const navigate = useNavigate();

  // Message state
  const [messageTitle, setMessageTitle] = React.useState('');
  const [messageContent, setMessageContent] = React.useState('');
  const [messageType, setMessageType] = React.useState('success');
  const [messageOpen, setMessageOpen] = React.useState(false);

  // Loading states
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Character fields state
  const [charName, setCharName] = React.useState("");
  const [charPrompt, setCharPrompt] = React.useState("");
  const [initialMemories, setInitialMemories] = React.useState("");
  const [exampleChats, setExampleChats] = React.useState("");
  const [useStickerSet, setUseStickerSet] = React.useState(null);
  const [useTTSModel, setUseTTSModel] = React.useState("None");
  const [tha4Service, setTHA4Service] = React.useState(null);

  const handleGenerateProfile = () => {
    if (!charName.trim()) {
      setMessageTitle('Input Required');
      setMessageContent('Please enter a character name first.');
      setMessageType('warning');
      setMessageOpen(true);
      return;
    }

    setIsGenerating(true);
    setMessageTitle('Generator is working...');
    setMessageContent('Generating character profile. This may take a minute...');
    setMessageType('info');
    setMessageOpen(true);

    // This assumes a new backend endpoint `createCharacterGenerator` is created
    // which takes a charName and uses the CREATE_CHARACTER_PROMPT.
    Remote.characterGenerator(charName).then(r => {
      if (r.status && r.data) {
        const profile = r.data;
        setCharPrompt(profile.charPrompt);
        setInitialMemories(profile.initialMemories);
        setExampleChats(profile.exampleChats);

        setMessageTitle('Profile Generated');
        setMessageContent('Generator has filled the character profile. Please review and edit if needed.');
        setMessageType('success');
        setMessageOpen(true);
      } else {
        throw new Error(r.data || 'Failed to generate profile from Generator.');
      }
    }).catch(e => {
      setMessageTitle('Generation Failed');
      setMessageContent(`An error occurred: ${e.message}`);
      setMessageType('error');
      setMessageOpen(true);
    }).finally(() => {
      setIsGenerating(false);
    });
  };

  const handleSubmit = () => {
    if (!charName.trim() || !charPrompt.trim()) {
      setMessageTitle('Input Required');
      setMessageContent('Character Name and Character Prompt are required fields.');
      setMessageType('warning');
      setMessageOpen(true);
      return;
    }

    setIsSubmitting(true);
    Remote.charNew(charName, useTTSModel, useStickerSet?.id || null, charPrompt, initialMemories, exampleChats, tha4Service).then(r => {
      if (r.data.status) {
        setMessageTitle('Success');
        setMessageContent(`Character "${charName}" created successfully!`);
        setMessageType('success');
        setMessageOpen(true);
      } else {
        throw new Error(r.data.data || 'An unknown error occurred.');
      }
    }).catch(e => {
      setMessageTitle('Creation Failed');
      setMessageContent(e.message);
      setMessageType('error');
      setMessageOpen(true);
    }).finally(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <Mui.Box sx={{ height: '100%', width: '100%', marginLeft: 10 }}>
      <Mui.Box data-overlayscrollbars-initialize sx={{ overflow: 'scroll', height: '100%', paddingRight: '15px' }}>
        <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />

        <Mui.Typography variant="h6" gutterBottom sx={{marginTop: 10, marginBottom: 2}}>Step 1: Generate Profile with Generator</Mui.Typography>
        <Mui.TextField
          fullWidth
          label="Character Name"
          variant="outlined"
          value={charName}
          onChange={(e) => setCharName(e.target.value)}
          helperText="Enter the full name of the character you want to create (e.g., 'Naganohara Yoimiya')."
          sx={{ marginBottom: 2 }}
          disabled={isGenerating}
        />
        <Mui.Button
          variant="contained"
          onClick={handleGenerateProfile}
          disabled={isGenerating || !charName}
          startIcon={isGenerating ? <Mui.CircularProgress size={20} color="inherit" /> : <icons.AutoAwesome />}
        >
          {isGenerating ? 'Generating...' : 'Generate Profile'}
        </Mui.Button>

        <Mui.Typography variant="h6" gutterBottom sx={{marginTop: 10, marginBottom: 2}}>Step 2: Review & Finalize</Mui.Typography>

        <Mui.List>
          <ContentEditDialog
            title="Character Prompt"
            description="A detailed guide for the Generator on how to imitate the character's personality, motivations, and speaking style."
            icon={<icons.Description />}
            defaultValue={charPrompt}
            onOk={(v) => setCharPrompt(v)}
            disabled={isGenerating}
          />
          <ContentEditDialog
            title="World Context / Memories"
            description="The character's canonical backstory, key life events, and relationships, written in the first person."
            icon={<icons.Bookmark />}
            defaultValue={initialMemories}
            onOk={(v) => setInitialMemories(v)}
            disabled={isGenerating}
          />
          <ContentEditDialog
            title="Example Chats"
            description="3-5 diverse dialogue snippets showcasing different facets of the character's personality."
            icon={<icons.ChatBubble />}
            defaultValue={exampleChats}
            onOk={(v) => setExampleChats(v)}
            disabled={isGenerating}
          />
          <TTSModelSelector
            onChange={(v) => setUseTTSModel(v)}
            defaultValue={useTTSModel}
            onErr={(e) => {
              setMessageType('error');
              setMessageTitle('Error');
              setMessageContent(e);
              setMessageOpen(true);
            }}
            disabled={isGenerating}
          />
          <THA4ServiceSelector
            disabled={isGenerating}
            onChange={v => setTHA4Service(v)}
            defaultValue={tha4Service}
            onErr={(e) => {
              setMessageType('error');
              setMessageTitle('Error');
              setMessageContent(e);
              setMessageOpen(true);
            }}
          />
          <StickerSetSelector
            onChange={(v) => setUseStickerSet(v)}
            defaultValue={useStickerSet}
            onErr={(e) => {
              setMessageType('error');
              setMessageTitle('Error');
              setMessageContent(e);
              setMessageOpen(true);
            }}
            disabled={isGenerating}
          />
        </Mui.List>

        <Mui.Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 0' }}>
          <Mui.Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={isGenerating || isSubmitting || !charName || !charPrompt}
            startIcon={isSubmitting ? <Mui.CircularProgress size={24} color="inherit" /> : <icons.AddCircle />}
          >
            {isSubmitting ? 'Creating...' : 'Create Character'}
          </Mui.Button>
        </Mui.Box>
      </Mui.Box>
    </Mui.Box>
  );
}

export default CreateCharacter;