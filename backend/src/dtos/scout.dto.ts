export class ScoutQueryDto {
  public command!: string;
  public season?: string;
  public league?: string;
  public team?: string;
  public player?: string;

  constructor(data: any) {
    this.command = data.command || '';
    this.season = data.season;
    this.league = data.league;
    this.team = data.team;
    this.player = data.player;
  }
}
