export interface WebService {
  app: any;
  usingHttps: boolean;
  httpsDomain?: string;
}

export interface MySQLResponse {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  info: string;
  serverStatus: number;
  warningStatus: number;
}

export interface SQLiteQueryParams {
  query: string;
  params?: object;
}

export interface SQLiteSelectParams {
  query: string;
}

export interface JWTProps {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  profile_picture: string;
}

export interface ImgurAPIResponse {
  data: {
    id: string;
    title: string | null;
    description: string | null;
    datetime: number;
    type: string;
    animated: boolean;
    width: number;
    height: number;
    size: number;
    views: number;
    bandwidth: number;
    vote: number | null;
    favorite: boolean;
    nsfw: string | null;
    section: string | null;
    account_url: string | null;
    account_id: number;
    is_ad: boolean;
    in_most_viral: boolean;
    has_sound: boolean;
    tags: string[];
    ad_type: number;
    ad_url: string;
    edited: string;
    in_gallery: boolean;
    deletehash: string;
    name: string;
    link: string;
  };
  status: number;
  success: boolean;
}
