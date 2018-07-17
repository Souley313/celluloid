import * as React from 'react';

import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Chip from '@material-ui/core/Chip';
import Switch from '@material-ui/core/Switch';
import Avatar from '@material-ui/core/Avatar/Avatar';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';

import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import * as Autosuggest from 'react-autosuggest';
const parse = require('autosuggest-highlight/parse');
const match = require('autosuggest-highlight/match');

import { levelLabel, levelsCount } from 'types/Levels';

import TagData from '../../../../../../common/src/types/TagTypes';
import { NewProjectData } from '../../../../../../common/src/types/ProjectTypes';
import { YouTubeVideo } from 'types/YouTubeVideo';

const TagAutosuggest = Autosuggest as { new(): Autosuggest<TagData> };

interface Props {
  video: YouTubeVideo;
  isOpen: boolean;
  tags: TagData[];
  onClose(send: boolean, value: NewProjectData): Promise<{}>;
}

const decorate = withStyles(({ palette, spacing }) => ({
  avatar: {
    border: '1px solid #757575',
    backgroundColor: '#fefefe'
  },
  container: {
    flexGrow: 1,
    position: 'relative' as 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute' as 'absolute',
    marginTop: spacing.unit,
    marginBottom: spacing.unit * 3,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
}));

const NewProject = decorate<Props>(
  class extends React.Component<Props & DialogProps
    & WithStyles<'avatar' | 'container' | 'suggestionsContainerOpen' |
    'suggestion' | 'input' | 'suggestionsList'>> {

    state = {
      videoTitle: '',
      title: '',
      description: '',
      objective: '',
      assignments: [] as string[],
      views: 0,
      shares: 0,
      levelStart: 0,
      levelEnd: levelsCount - 1,
      nextAssignment: '',
      searchTag: '',
      public: false,
      collaborative: false,
      tags: new Set<TagData>(),
      error: undefined,
      suggestions: []
    };

    render() {
      const { fullScreen, video, isOpen } = this.props;

      const onClose = (send: boolean) => (event: React.MouseEvent<HTMLElement>) => {
        const project = {
          videoId: this.props.video.id,
          title: this.state.title,
          description: this.state.description,
          objective: this.state.objective,
          assignments: this.state.assignments,
          levelStart: this.state.levelStart,
          levelEnd: this.state.levelEnd,
          tags: Array.from(this.state.tags),
          public: this.state.public,
          collaborative: this.state.collaborative
        };
        this.props.onClose(send, project)
          .then(() => {
            this.setState({
              videoTitle: '',
              title: '',
              description: '',
              objective: '',
              assignments: [] as string[],
              views: 0,
              shares: 0,
              levelStart: 0,
              levelEnd: levelsCount - 1,
              nextAssignment: '',
              searchTag: '',
              public: false,
              collaborative: false,
              tags: new Set<TagData>(),
              error: undefined,
              suggestions: []
            });
          })
          .catch(error => {
            this.setState({ error: error.message });
          });
      };

      const onSuggestionSelected = (
        event: React.FormEvent<HTMLInputElement>,
        data: Autosuggest.SuggestionSelectedEventData<TagData>
      ): void => {
        const state = this.state;
        if (state.tags.has(data.suggestion)) {
          state.tags.delete(data.suggestion);
        } else {
          state.tags.add(data.suggestion);
        }
        this.setState(state);
      };

      const renderSuggestionsContainer = (params: Autosuggest.RenderSuggestionsContainerParams) => {
        const { containerProps, children } = params;

        return (
          <Paper {...containerProps} square={true} style={{ zIndex: 999 }}>
            {children}
          </Paper>
        );
      };

      const renderSuggestion = (suggestion: TagData, params: Autosuggest.RenderSuggestionParams): JSX.Element => {
        const matches = match(suggestion.name, params.query);
        const parts = parse(suggestion.name, matches);

        return (
          <MenuItem selected={params.isHighlighted} component="div">
            <div>
              {parts.map((part: { text: string, highlight: boolean }, index: number) => {
                return part.highlight ? (
                  <span key={String(index)} style={{ fontWeight: 300 }}>
                    {part.text}
                  </span>
                ) : (
                    <strong key={String(index)} style={{ fontWeight: 500 }}>
                      {part.text}
                    </strong>
                  );
              })}
            </div>
          </MenuItem>
        );
      };

      const getSuggestions = (value: string) => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        return inputLength === 0 ? [] : this.props.tags.filter(tag =>
          tag.name.toLowerCase().slice(0, inputLength) === inputValue
        );
      };

      const onSuggestionFetchRequested = ({ value }: Autosuggest.SuggestionsFetchRequestedParams): void => {
        this.setState({
          suggestions: getSuggestions(value)
        });
      };

      const getSuggestionValue = (suggestion: TagData): string => {
        return suggestion.name;
      };

      const renderInputComponent = (props: Autosuggest.InputProps<TagData>) => {
        const {
          classes,
          ref,
          height,
          width,
          form,
          formAction,
          formEncType,
          formMethod,
          formNoValidate,
          formTarget,
          min,
          max,
          required,
          alt,
          src,
          accept,
          capture,
          checked,
          crossOrigin,
          list,
          maxLength,
          minLength,
          multiple,
          pattern,
          readOnly,
          size,
          step,
          defaultValue,
          ...others
        } = props;

        return (
          <TextField
            fullWidth={true}
            InputProps={{
              inputRef: ref,
              classes: {
                input: classes.input
              },
              ...others
            }}
          />
        );
      };

      const onSuggestChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>,
        { newValue, method }: Autosuggest.ChangeEvent): void => {
        this.setState({ searchTag: newValue });
      };

      const inputProps = {
        placeholder: 'rechercher...',
        classes: this.props.classes,
        value: this.state.searchTag,
        onChange: onSuggestChange,
      };

      return (
        <Dialog
          fullScreen={fullScreen}
          open={isOpen}
          fullWidth={true}
        >
          <DialogTitle style={{ textAlign: 'center' }}>
            <span style={{ position: 'absolute', right: 16, top: 8 }}>
              <IconButton onClick={onClose(false)}><CloseIcon /></IconButton>
            </span>
            {'Nouveau projet'}
          </DialogTitle>
          <DialogContent>
            <div
              style={{
                width: '100%',
                height: 256,
                backgroundImage: `url(${video.thumbnailUrl})`,
                backgroundPosition: 'center' as 'center',
                backgroundAttachment: 'contain' as 'contain',
                backgroundRepeat: 'no-repeat' as 'no-repeat'
              }}
            />
            <div
              style={{
                justifyContent: 'center',
                padding: 16,
                display: 'flex',
                flexWrap: 'wrap'
              }}
            >
              <Typography
                variant="title"
                gutterBottom={true}
              >
                {this.props.video.title}
              </Typography>
            </div>
            <TextField
              label="Titre"
              helperText="Le titre permet de référencer votre séquence sur la plate-forme"
              onChange={event => {
                this.setState({ title: event.target.value });
              }}
            />
            <TextField
              label="Description"
              helperText="Décrivez brièvement le contenu de la vidéo"
              multiline={true}
              onChange={event => {
                this.setState({ description: event.target.value });
              }}
            />
            <TextField
              label="Objectif"
              helperText="Rédigez un objectif global pour ce projet"
              multiline={true}
              onChange={event => {
                this.setState({ objective: event.target.value });
              }}
            />
            <Typography variant="title" style={{ paddingTop: 36 }} gutterBottom={true}>
              {`Activités proposées`}
            </Typography>
            <Typography variant="subheading">
              {`Listez les différentes questions et actions à remplir, relatives à l'ensemble de la vidéo`}
            </Typography>
            <List>
              {this.state.assignments.map((assignment, index) =>
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar
                      style={{
                        borderRadius: '2%',
                        fontSize: '12pt',
                      }}
                    >
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={assignment} />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => {
                        const assignments = this.state.assignments;
                        assignments.splice(index, 1);
                        this.setState({
                          assignments
                        });
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )}
              <ListItem>
                <ListItemAvatar>
                  <Avatar
                    style={{
                      border: '1px solid #757575',
                      background: '#FEFEFE',
                      color: '#757575',
                      borderRadius: '2%',
                      fontSize: '12pt',
                    }}
                  >
                    {this.state.assignments.length + 1}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <TextField
                      label="Ajouter une activité"
                      style={{ display: 'flex', flex: 1 }}
                      value={this.state.nextAssignment}
                      onChange={event => {
                        this.setState({ nextAssignment: event.target.value });
                      }}
                    />
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={() => {
                      const assignments = this.state.assignments;
                      assignments.push(this.state.nextAssignment);
                      this.setState({
                        assignments,
                        nextAssignment: ''
                      });
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Typography variant="title" style={{ paddingTop: 36 }} gutterBottom={true}>
              {`Matière `}
            </Typography>
            <Typography variant="subheading">
              {`Indiquez le domaine ou la matière dont traite votre séquence`}
            </Typography>
            <div
              style={{
                justifyContent: 'center',
                padding: 16,
                display: 'flex',
                flexWrap: 'wrap'
              }}
            >
              {
                this.props.tags
                  .filter(tag => tag.featured || this.state.tags.has(tag))
                  .map(tag =>
                    <Chip
                      onClick={() => {
                        const state = this.state;
                        if (state.tags.has(tag)) {
                          state.tags.delete(tag);
                        } else {
                          state.tags.add(tag);
                        }
                        this.setState(state);
                      }}
                      onDelete={
                        this.state.tags.has(tag) ?
                          () => {
                            const state = this.state;
                            if (state.tags.has(tag)) {
                              state.tags.delete(tag);
                            } else {
                              state.tags.add(tag);
                            }
                            this.setState(state);
                          } : undefined
                      }
                      key={tag.id}
                      label={tag.name}
                      style={{
                        margin: 4
                      }}
                    />
                  )
              }
            </div>
            <div
              style={{
                justifyContent: 'center',
                display: 'flex',
                flexWrap: 'wrap'
              }}
            >
              <Typography>
                Ou bien recherchez ou ajoutez un domaine
              </Typography>
            </div>
            <div
              style={{
                justifyContent: 'center',
                display: 'flex',
                flexWrap: 'wrap'
              }}
            >
              <TagAutosuggest
                theme={{
                  container: this.props.classes.container,
                  suggestionsContainerOpen: this.props.classes.suggestionsContainerOpen,
                  suggestionsList: this.props.classes.suggestionsList,
                  suggestion: this.props.classes.suggestion,
                }}
                renderInputComponent={renderInputComponent}
                suggestions={this.state.suggestions}
                onSuggestionsFetchRequested={onSuggestionFetchRequested}
                alwaysRenderSuggestions={true}
                renderSuggestionsContainer={renderSuggestionsContainer}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                onSuggestionSelected={onSuggestionSelected}
                inputProps={inputProps}
              />
            </div>
            <Typography variant="title" style={{ paddingTop: 36 }} gutterBottom={true}>
              {`Niveau `}
            </Typography>
            <Typography variant="subheading">
              {`Veuillez préciser à quels niveaux de scolarité s'adresse cette séquence`}
            </Typography>
            <div
              style={{
                padding: '16px 72px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  textAlign: 'center',
                  width: 72,
                  marginLeft: 36,
                  left: 0
                }}
              >
                <Typography
                  variant="caption"
                  style={{ textAlign: 'center' }}
                >
                  {levelLabel(this.state.levelStart)}
                </Typography>
              </div>
              <div
                style={{
                  position: 'absolute',
                  textAlign: 'center',
                  width: 72,
                  marginRight: 36,
                  right: 0
                }}
              >
                <Typography
                  variant="caption"
                  style={{ textAlign: 'center' }}
                >
                  {levelLabel(this.state.levelEnd)}
                </Typography>
              </div>
              <div style={{ paddingTop: 32 }}>
                <Range
                  min={0}
                  max={levelsCount - 1}
                  value={[this.state.levelStart, this.state.levelEnd]}
                  onChange={values => {
                    this.setState({ levelStart: values[0], levelEnd: values[1] });
                  }}
                  trackStyle={[{ backgroundColor: 'orange' }]}
                  handleStyle={[{ borderColor: 'orange' }, { borderColor: 'orange' }]}
                  allowCross={false}
                />
              </div>
            </div>
            <Typography variant="title" style={{ paddingTop: 36 }} gutterBottom={true}>
              {`Partage`}
            </Typography>
            <Grid
              container={true}
              direction="row"
              alignItems="flex-start"
            >
              <Grid item={true} xs={2}>
                <Typography
                  variant="subheading"
                  style={{ paddingTop: 12, textAlign: 'right' }}
                >
                  {`Public`}
                </Typography>
              </Grid>
              <Grid
                item={true}
                xs={2}
              >
                <Switch
                  checked={this.state.public}
                  onChange={(event, value) => {
                    this.setState({ public: value });
                  }}
                />
              </Grid>
              <Grid item={true} xs={8}>
                <Typography
                  gutterBottom={true}
                  style={{ paddingTop: 12 }}
                >
                  {`Cela signifie que vous partagez cette séquence`
                    + ` avec tous les utilisateurs de la plateforme`
                    + ` Celluloid. Les annotations des élève ne peuvent pas`
                    + ` êtres vues. C'est vous qui êtes administrateur de`
                    + ` cette visibilité.`}
                </Typography>
                <Typography gutterBottom={true}>
                  {`Votre projet sera libre de droit et de`
                    + ` réutilisation sur la plateforme`}
                </Typography>
              </Grid>
            </Grid>
            <Grid
              container={true}
              direction="row"
              alignItems="flex-start"
            >
              <Grid item={true} xs={2}>
                <Typography
                  variant="subheading"
                  style={{ paddingTop: 12, textAlign: 'right' }}
                >
                  {`Collaboratif`}
                </Typography>
              </Grid>
              <Grid
                item={true}
                xs={2}
              >
                <Switch
                  checked={this.state.collaborative}
                  onChange={(event, value) => {
                    this.setState({ collaborative: value });
                  }}
                />
              </Grid>
              <Grid item={true} xs={8}>
                <Typography
                  gutterBottom={true}
                  style={{ paddingTop: 12 }}
                >
                  {`Cela signifie que les personnes invitées à annoter`
                    + ` la vidéo pourront voir les annotations de`
                    + ` chacun des participants du projet`}

                </Typography>
              </Grid>
            </Grid>
            {this.state.error &&
              <Typography
                style={{ padding: 24, color: 'red', textAlign: 'center' }}
              >
                {this.state.error}
              </Typography>
            }
          </DialogContent>
          <DialogActions style={{ textAlign: 'center' }}>
            <Button
              onClick={onClose(true)}
              color="primary"
              variant="raised"
            >
              {`Enregistrer`}
            </Button>
          </DialogActions>
        </Dialog >
      );
    }
  }
);

export default NewProject;